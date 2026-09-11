"""
models.py
---------
SQLAlchemy ORM models for the Illam Chuttu Eliye Kolluka backend.
Tables: users, challenges, leaderboard.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
class Difficulty(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    """
    Represents a registered player.
    user_id: UUID primary key generated server-side.
    total_score: Accumulated lifetime score across all sessions.
    """

    __tablename__ = "users"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    username: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    total_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    leaderboard_entries: Mapped[list["Leaderboard"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.user_id} username={self.username!r}>"


# ---------------------------------------------------------------------------
# Challenge
# ---------------------------------------------------------------------------
class Challenge(Base):
    """
    A Python debugging challenge paired with test cases.
    bugged_code: The deliberately broken Python snippet shown to the player.
    test_cases: JSON array of {input, expected_output} objects used to
                validate the player's corrected code via the sandbox.
    """

    __tablename__ = "challenges"

    task_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    difficulty: Mapped[Difficulty] = mapped_column(
        Enum(Difficulty, name="difficulty_enum"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    bugged_code: Mapped[str] = mapped_column(Text, nullable=False)
    # Example: [{"input": "add(2,3)", "expected_output": "5"}, ...]
    test_cases: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Challenge id={self.task_id} difficulty={self.difficulty}>"


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------
class Leaderboard(Base):
    """
    Records per-session scores for ranking purposes.
    One user can have multiple entries (one per completed game session).
    """

    __tablename__ = "leaderboard"

    entry_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    difficulty_level: Mapped[Difficulty] = mapped_column(
        Enum(Difficulty, name="difficulty_enum"),
        nullable=False,
    )
    achieved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="leaderboard_entries")

    def __repr__(self) -> str:
        return f"<Leaderboard entry_id={self.entry_id} score={self.score}>"
