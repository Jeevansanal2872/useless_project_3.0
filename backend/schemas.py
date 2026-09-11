"""
schemas.py
----------
Pydantic v2 request / response schemas for API validation and serialisation.
These are kept separate from the SQLAlchemy ORM models to preserve a clean
separation of concerns between the persistence layer and the API layer.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from models import Difficulty


# ---------------------------------------------------------------------------
# Shared config
# ---------------------------------------------------------------------------
class _ORMBase(BaseModel):
    """Base with ORM mode enabled for all response schemas."""
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=64)


class UserRead(_ORMBase):
    user_id: uuid.UUID
    username: str
    total_score: int
    created_at: datetime


# ---------------------------------------------------------------------------
# Challenge schemas
# ---------------------------------------------------------------------------
class ChallengeRead(_ORMBase):
    task_id: int
    difficulty: Difficulty
    title: str
    description: str | None
    bugged_code: str
    # test_cases is NOT returned to the client (would expose answers)


class ChallengePublic(BaseModel):
    """Minimal payload sent to the frontend when a fire spawns."""
    task_id: int
    title: str
    description: str | None
    bugged_code: str
    difficulty: Difficulty


# ---------------------------------------------------------------------------
# Leaderboard schemas
# ---------------------------------------------------------------------------
class LeaderboardEntry(_ORMBase):
    entry_id: int
    user_id: uuid.UUID
    score: int
    difficulty_level: Difficulty
    achieved_at: datetime


class LeaderboardPosition(BaseModel):
    """Rank of the current session score on the global leaderboard."""
    rank: int
    total_entries: int
    score: int


# ---------------------------------------------------------------------------
# Game session request / response schemas
# ---------------------------------------------------------------------------
class GameStartRequest(BaseModel):
    user_id: uuid.UUID
    difficulty: Difficulty


class GameStartResponse(BaseModel):
    session_id: str
    message: str = "Session started. Good luck!"


class FireSpawnRequest(BaseModel):
    session_id: str


class FireSpawnResponse(BaseModel):
    fire_id: str          # Unique ID for this fire instance stored in Redis
    challenge: ChallengePublic
    fire_start_timestamp: float  # Unix epoch seconds


class FireSolveRequest(BaseModel):
    session_id: str
    task_id: int
    fire_id: str
    submitted_code: str = Field(..., min_length=1, max_length=16_000)


class FireSolveResponse(BaseModel):
    success: bool
    points_earned: int = 0
    power_up: str = "NONE"
    new_total_score: int
    error_traceback: str | None = None
    message: str


class RatHitRequest(BaseModel):
    session_id: str


class RatHitResponse(BaseModel):
    points_earned: int = 3
    new_total_score: int
    can_win: bool
    active_fires: int     # How many fires are currently burning
    message: str


class GameEndRequest(BaseModel):
    session_id: str


class GameEndResponse(BaseModel):
    final_score: int
    leaderboard: LeaderboardPosition
    message: str


# ---------------------------------------------------------------------------
# Error responses
# ---------------------------------------------------------------------------
class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class GameOverResponse(BaseModel):
    detail: str = "GAME OVER – The house has burned down!"
    code: str = "GAME_OVER"
    session_id: str
