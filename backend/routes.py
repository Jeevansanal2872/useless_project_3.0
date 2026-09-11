"""
routes.py
---------
All FastAPI API endpoints for the Illam Chuttu Eliye Kolluka game backend.

Endpoint summary
----------------
POST /api/game/start        – Create a Redis game session.
POST /api/game/fire/spawn   – Assign a random Challenge and record fire timestamp.
POST /api/game/fire/solve   – Validate submitted code; clear fire on success.
POST /api/game/rat/hit      – Award +3 pts for hitting the rat.
POST /api/game/end          – Persist final score to Leaderboard; delete session.

Bonus (utility) endpoints
-------------------------
POST /api/users/register    – Register a new player (creates DB record).
GET  /api/leaderboard       – Return top-N global scores.
"""

from __future__ import annotations

import time
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

import game_logic
import code_sandbox
from database import get_db, get_redis
from models import Challenge, Difficulty, Leaderboard, User
from schemas import (
    ChallengePublic,
    FireSolveRequest,
    FireSolveResponse,
    FireSpawnRequest,
    FireSpawnResponse,
    GameEndRequest,
    GameEndResponse,
    GameStartRequest,
    GameStartResponse,
    LeaderboardEntry,
    LeaderboardPosition,
    RatHitRequest,
    RatHitResponse,
    UserCreate,
    UserRead,
)

router = APIRouter(prefix="/api", tags=["game"])


# ===========================================================================
# 1. User Registration (utility)
# ===========================================================================
@router.post(
    "/users/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new player",
)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """
    Create a new User record in PostgreSQL.

    Raises 409 Conflict if the username is already taken.
    """
    # Check uniqueness
    result = await db.execute(select(User).where(User.username == payload.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{payload.username}' is already taken.",
        )

    user = User(username=payload.username)
    db.add(user)
    await db.flush()   # assigns PK without committing
    await db.refresh(user)
    return UserRead.model_validate(user)


# ===========================================================================
# 2. POST /api/game/start
# ===========================================================================
@router.post(
    "/game/start",
    response_model=GameStartResponse,
    summary="Start a new game session",
)
async def start_game(
    payload: GameStartRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> GameStartResponse:
    """
    Validate that the user exists in PostgreSQL, then initialise a fresh
    Redis game session.

    Returns a session_id the client must include in all subsequent requests.
    """
    # Verify user exists
    result = await db.execute(
        select(User).where(User.user_id == payload.user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{payload.user_id}' not found. Please register first.",
        )

    session_id = await game_logic.create_session(
        redis, str(payload.user_id), payload.difficulty
    )
    return GameStartResponse(session_id=session_id)


# ===========================================================================
# 3. POST /api/game/fire/spawn
# ===========================================================================
@router.post(
    "/game/fire/spawn",
    response_model=FireSpawnResponse,
    summary="Spawn a fire (assign a random coding challenge)",
)
async def spawn_fire(
    payload: FireSpawnRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> FireSpawnResponse:
    """
    Select a random Challenge from PostgreSQL matching the session's difficulty,
    register a FireEvent in Redis, and return the challenge to the client.

    The 5-minute countdown starts the moment this endpoint responds.
    """
    # Load session to get difficulty
    session = await game_logic.get_session(redis, payload.session_id)

    difficulty = Difficulty(session.difficulty)

    # Pick a random challenge of the correct difficulty from Postgres
    # Using random() in ORDER BY is fine for small challenge pools;
    # replace with tablesample for very large tables.
    result = await db.execute(
        select(Challenge)
        .where(Challenge.difficulty == difficulty)
        .order_by(func.random())
        .limit(1)
    )
    challenge: Challenge | None = result.scalar_one_or_none()
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"No challenges available for difficulty '{difficulty.value}'. "
                   "Please seed the database.",
        )

    # Register fire in Redis (starts the clock)
    fire_event = await game_logic.spawn_fire(
        redis, payload.session_id, challenge.task_id
    )

    return FireSpawnResponse(
        fire_id=fire_event.fire_id,
        challenge=ChallengePublic(
            task_id=challenge.task_id,
            title=challenge.title,
            description=challenge.description,
            bugged_code=challenge.bugged_code,
            difficulty=challenge.difficulty,
        ),
        fire_start_timestamp=fire_event.fire_start_timestamp,
    )


# ===========================================================================
# 4. POST /api/game/fire/solve
# ===========================================================================
@router.post(
    "/game/fire/solve",
    response_model=FireSolveResponse,
    summary="Submit fixed code to extinguish a fire",
)
async def solve_fire(
    payload: FireSolveRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> FireSolveResponse:
    """
    Validate the 5-minute timer → run submitted code through the sandbox →
    award points and a power-up on success → clear the fire from Redis.

    On failure the fire remains active; the traceback is returned so the
    frontend can show it to the player.
    """
    # 1. Load session and locate the fire (also validates session existence)
    session = await game_logic.get_session(redis, payload.session_id)
    fire_data = game_logic._find_fire(session, payload.fire_id)

    # 2. Timer check (raises HTTP 410 → GAME_OVER if expired)
    await game_logic.check_timer(
        fire_data["fire_start_timestamp"], payload.session_id
    )

    # 3. Fetch challenge test cases from DB
    result = await db.execute(
        select(Challenge).where(Challenge.task_id == payload.task_id)
    )
    challenge: Challenge | None = result.scalar_one_or_none()
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge {payload.task_id} not found.",
        )

    # 4. Execute code in sandbox
    solve_start = time.time()
    sandbox_result = await code_sandbox.validate_code(
        payload.submitted_code, challenge.test_cases
    )
    time_taken = time.time() - solve_start

    if not sandbox_result.passed:
        return FireSolveResponse(
            success=False,
            points_earned=0,
            power_up="NONE",
            new_total_score=session.current_score,
            error_traceback=sandbox_result.traceback,
            message="Incorrect solution – the fire is still burning!",
        )

    # 5. Success: resolve fire, update score, roll power-up
    updated_session = await game_logic.resolve_fire(
        redis, payload.session_id, payload.fire_id
    )
    elapsed_since_spawn = time.time() - fire_data["fire_start_timestamp"]
    power_up = game_logic.roll_powerup(
        Difficulty(session.difficulty), elapsed_since_spawn
    )

    return FireSolveResponse(
        success=True,
        points_earned=game_logic.FIRE_SOLVE_POINTS,
        power_up=power_up,
        new_total_score=updated_session.current_score,
        error_traceback=None,
        message="Fire extinguished! Great debugging!",
    )


# ===========================================================================
# 5. POST /api/game/rat/hit
# ===========================================================================
@router.post(
    "/game/rat/hit",
    response_model=RatHitResponse,
    summary="Record a successful rat hit",
)
async def rat_hit(
    payload: RatHitRequest,
    redis: Redis = Depends(get_redis),
) -> RatHitResponse:
    """
    Award +3 points for hitting the rat.

    Also checks whether any fires are still active, since the frontend
    needs to know if the win condition is reachable (can_win = no active fires).
    """
    updated_session = await game_logic.add_rat_hit_score(redis, payload.session_id)
    active_fire_count = len(updated_session.active_fires)
    can_win = active_fire_count == 0

    return RatHitResponse(
        points_earned=game_logic.RAT_HIT_POINTS,
        new_total_score=updated_session.current_score,
        can_win=can_win,
        active_fires=active_fire_count,
        message=(
            "🐀 Rat hit! +3 points."
            if can_win
            else f"🔥 Rat hit! But {active_fire_count} fire(s) are still burning!"
        ),
    )


# ===========================================================================
# 6. POST /api/game/end
# ===========================================================================
@router.post(
    "/game/end",
    response_model=GameEndResponse,
    summary="End the game session and persist the score",
)
async def end_game(
    payload: GameEndRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> GameEndResponse:
    """
    Finalise the game:
    1. Fetch the final score from Redis.
    2. Persist a Leaderboard entry in PostgreSQL.
    3. Update the User's total_score.
    4. Delete the Redis session.
    5. Return the final score and global rank.
    """
    # Retrieve session before deleting it
    session = await game_logic.get_session(redis, payload.session_id)
    final_score = await game_logic.end_session(redis, payload.session_id)

    # Persist to leaderboard
    entry = Leaderboard(
        user_id=uuid.UUID(session.user_id),
        score=final_score,
        difficulty_level=Difficulty(session.difficulty),
    )
    db.add(entry)

    # Update user's cumulative score
    user_result = await db.execute(
        select(User).where(User.user_id == uuid.UUID(session.user_id))
    )
    user: User | None = user_result.scalar_one_or_none()
    if user:
        user.total_score += final_score

    await db.flush()

    # Calculate global rank (how many entries have score > final_score + 1)
    rank_result = await db.execute(
        select(func.count(Leaderboard.entry_id)).where(
            Leaderboard.score > final_score
        )
    )
    rank = (rank_result.scalar() or 0) + 1  # 1-indexed

    total_result = await db.execute(
        select(func.count(Leaderboard.entry_id))
    )
    total_entries = total_result.scalar() or 1

    return GameEndResponse(
        final_score=final_score,
        leaderboard=LeaderboardPosition(
            rank=rank,
            total_entries=total_entries,
            score=final_score,
        ),
        message=f"Game over! You scored {final_score} points. Global rank: #{rank}",
    )


# ===========================================================================
# 7. GET /api/leaderboard  (utility)
# ===========================================================================
@router.get(
    "/leaderboard",
    response_model=list[LeaderboardEntry],
    summary="Fetch top-N global leaderboard entries",
)
async def get_leaderboard(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
) -> list[LeaderboardEntry]:
    """Return the top `limit` leaderboard entries ordered by score descending."""
    result = await db.execute(
        select(Leaderboard)
        .order_by(Leaderboard.score.desc())
        .limit(max(1, min(limit, 100)))   # Clamp between 1 and 100
    )
    entries = result.scalars().all()
    return [LeaderboardEntry.model_validate(e) for e in entries]
