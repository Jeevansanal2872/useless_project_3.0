"""
game_logic.py
-------------
Core in-memory game-state management via Redis.
Handles session lifecycle, fire spawn/resolve, the strict 5-minute server-side
timer, scoring, and RNG power-up rolls.

Key design decisions
--------------------
* All mutable session state lives in Redis as a JSON blob keyed by session_id.
  This makes horizontal scaling trivial – any API node can serve any request.
* The 5-minute timer is evaluated lazily (checked on every relevant request)
  rather than via a background scheduler, to keep the architecture simple.
* Power-up decay for HARD difficulty penalises slow solvers while still giving
  fast solvers a random bonus.
"""

from __future__ import annotations

import json
import random
import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Any

from fastapi import HTTPException, status
from redis.asyncio import Redis

from database import redis_set_json, redis_get_json
from models import Difficulty

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
FIRE_TIMEOUT_SECONDS: int = 300          # 5 minutes
SESSION_TTL_SECONDS: int = 7200          # 2 hours max session lifetime
RAT_HIT_POINTS: int = 3
FIRE_SOLVE_POINTS: int = 1
SESSION_KEY_PREFIX: str = "game:session:"

POWERUPS_POOL: list[str] = ["SPEED_BOOST", "WIDER_TORCH", "NONE"]


# ---------------------------------------------------------------------------
# Session data-class (serialised into Redis)
# ---------------------------------------------------------------------------
@dataclass
class FireEvent:
    fire_id: str
    task_id: int
    fire_start_timestamp: float      # Unix epoch, set at spawn time

    def as_dict(self) -> dict:
        return asdict(self)


@dataclass
class GameSession:
    session_id: str
    user_id: str
    difficulty: str                  # Difficulty enum value as string
    current_score: int = 0
    active_fires: list[dict] = field(default_factory=list)
    is_active: bool = True

    def as_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "GameSession":
        session = cls(
            session_id=data["session_id"],
            user_id=data["user_id"],
            difficulty=data["difficulty"],
            current_score=data.get("current_score", 0),
            active_fires=data.get("active_fires", []),
            is_active=data.get("is_active", True),
        )
        return session


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _session_key(session_id: str) -> str:
    return f"{SESSION_KEY_PREFIX}{session_id}"


async def _load_session(redis: Redis, session_id: str) -> GameSession:
    """
    Load and deserialise a GameSession from Redis.
    Raises HTTP 404 if the session does not exist (expired or never created).
    """
    raw = await redis_get_json(redis, _session_key(session_id))
    if raw is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found or has expired.",
        )
    return GameSession.from_dict(raw)


async def _save_session(redis: Redis, session: GameSession) -> None:
    """Persist the updated session back into Redis."""
    await redis_set_json(
        redis,
        _session_key(session.session_id),
        session.as_dict(),
        ttl=SESSION_TTL_SECONDS,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def create_session(
    redis: Redis,
    user_id: str,
    difficulty: Difficulty,
) -> str:
    """
    Initialise a brand-new game session in Redis.

    Parameters
    ----------
    redis      : Injected Redis client.
    user_id    : UUID string of the authenticated player.
    difficulty : Chosen game difficulty (EASY | MEDIUM | HARD).

    Returns
    -------
    session_id : Unique ID for this game session.
    """
    session_id = str(uuid.uuid4())
    session = GameSession(
        session_id=session_id,
        user_id=user_id,
        difficulty=difficulty.value,
        current_score=0,
        active_fires=[],
        is_active=True,
    )
    await _save_session(redis, session)
    return session_id


async def spawn_fire(
    redis: Redis,
    session_id: str,
    task_id: int,
) -> FireEvent:
    """
    Record a new fire event in the session.

    A fire is associated with a specific Challenge (identified by task_id).
    The timestamp is recorded here so the 5-minute countdown starts
    the moment the challenge is delivered to the player.

    Parameters
    ----------
    redis      : Injected Redis client.
    session_id : Active session identifier.
    task_id    : The Challenge.task_id selected for this fire.

    Returns
    -------
    FireEvent with a unique fire_id and the current epoch timestamp.
    """
    session = await _load_session(redis, session_id)
    _assert_session_active(session)

    fire = FireEvent(
        fire_id=str(uuid.uuid4()),
        task_id=task_id,
        fire_start_timestamp=time.time(),
    )
    session.active_fires.append(fire.as_dict())
    await _save_session(redis, session)
    return fire


async def resolve_fire(
    redis: Redis,
    session_id: str,
    fire_id: str,
) -> GameSession:
    """
    Remove a resolved fire from the active list and award points.

    Also validates that the 5-minute timer for *this specific fire* hasn't
    already expired before crediting the score. If the timer has blown, the
    session is marked inactive (Game Over) and HTTP 410 is raised.

    Parameters
    ----------
    redis      : Injected Redis client.
    session_id : Active session identifier.
    fire_id    : Unique ID of the fire being extinguished.

    Returns
    -------
    Updated GameSession after score increment and fire removal.
    """
    session = await _load_session(redis, session_id)
    _assert_session_active(session)

    # Locate the fire
    fire_data = _find_fire(session, fire_id)
    await check_timer(fire_data["fire_start_timestamp"], session_id)

    # Award points and remove the fire
    session.current_score += FIRE_SOLVE_POINTS
    session.active_fires = [
        f for f in session.active_fires if f["fire_id"] != fire_id
    ]
    await _save_session(redis, session)
    return session


async def add_rat_hit_score(redis: Redis, session_id: str) -> GameSession:
    """
    Award RAT_HIT_POINTS (3) to the session score.

    Returns the updated session so callers can inspect active_fires.
    """
    session = await _load_session(redis, session_id)
    _assert_session_active(session)
    session.current_score += RAT_HIT_POINTS
    await _save_session(redis, session)
    return session


async def get_session(redis: Redis, session_id: str) -> GameSession:
    """Return the current session state without modifying it."""
    return await _load_session(redis, session_id)


async def end_session(redis: Redis, session_id: str) -> int:
    """
    Retrieve the final score and delete the Redis session.

    Returns
    -------
    final_score : The score at session termination.
    """
    session = await _load_session(redis, session_id)
    final_score = session.current_score
    await redis.delete(_session_key(session_id))
    return final_score


# ---------------------------------------------------------------------------
# Timer logic
# ---------------------------------------------------------------------------
async def check_timer(fire_start_timestamp: float, session_id: str) -> None:
    """
    Evaluate whether the 5-minute window for a given fire has expired.

    The timer check is *stateless* – it compares the current wall-clock time
    against the `fire_start_timestamp` stored in Redis when the fire spawned.
    This design means clock skew between API nodes is irrelevant as long as
    the nodes use UTC (which Python's `time.time()` always does).

    Parameters
    ----------
    fire_start_timestamp : Unix epoch float recorded at fire spawn.
    session_id           : Used only for the error response payload.

    Raises
    ------
    HTTPException(410) – "GAME_OVER" when the timer has expired.
                         HTTP 410 Gone is semantically apt: the resource
                         (extinguishable fire) is gone and won't come back.
    """
    elapsed: float = time.time() - fire_start_timestamp
    if elapsed > FIRE_TIMEOUT_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail={
                "code": "GAME_OVER",
                "message": (
                    f"GAME OVER – The house has burned down! "
                    f"Fire burned for {elapsed:.1f}s (limit: {FIRE_TIMEOUT_SECONDS}s)."
                ),
                "session_id": session_id,
            },
        )


def time_remaining(fire_start_timestamp: float) -> float:
    """Return seconds remaining before a fire triggers Game Over (may be negative)."""
    return FIRE_TIMEOUT_SECONDS - (time.time() - fire_start_timestamp)


# ---------------------------------------------------------------------------
# Power-up logic
# ---------------------------------------------------------------------------
def roll_powerup(difficulty: Difficulty, time_taken_to_solve: float) -> str:
    """
    Randomly award a power-up based on difficulty and solve speed.

    Decay rule (HARD difficulty)
    ----------------------------
    If the player takes more than 60 seconds to solve a HARD challenge,
    the power-up award decays to "NONE". This incentivises fast thinking
    on the most challenging puzzles without outright preventing the player
    from progressing.

    Easy / Medium
    -------------
    Rolls uniformly across ["SPEED_BOOST", "WIDER_TORCH", "NONE"].
    Each outcome has a 1-in-3 (~33%) chance.

    Parameters
    ----------
    difficulty           : The difficulty of the challenge just solved.
    time_taken_to_solve  : Seconds elapsed between fire spawn and correct solve.

    Returns
    -------
    One of "SPEED_BOOST", "WIDER_TORCH", or "NONE".
    """
    if difficulty == Difficulty.HARD and time_taken_to_solve > 60:
        # Decay: penalise slow solvers on hard mode
        return "NONE"

    return random.choice(POWERUPS_POOL)


# ---------------------------------------------------------------------------
# Internal guards
# ---------------------------------------------------------------------------
def _assert_session_active(session: GameSession) -> None:
    """Raise HTTP 409 Conflict if the session has already ended."""
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This game session has already ended.",
        )


def _find_fire(session: GameSession, fire_id: str) -> dict:
    """
    Locate a fire event by fire_id in the session's active_fires list.
    Raises HTTP 404 if the fire doesn't exist (already resolved or wrong ID).
    """
    for fire in session.active_fires:
        if fire["fire_id"] == fire_id:
            return fire
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Fire '{fire_id}' not found in session '{session.session_id}'.",
    )
