"""
database.py
-----------
Manages async PostgreSQL (via SQLAlchemy + asyncpg) and async Redis connections.
Both are exposed as FastAPI dependency-injectable factories.
"""

from __future__ import annotations

import json
import os
from typing import AsyncGenerator

from redis.asyncio import Redis, ConnectionPool
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

# ---------------------------------------------------------------------------
# Settings (read from environment / .env)
# ---------------------------------------------------------------------------
POSTGRES_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/illam_chuttu",
)
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ---------------------------------------------------------------------------
# SQLAlchemy – Async Engine & Session Factory
# ---------------------------------------------------------------------------
engine: AsyncEngine = create_async_engine(
    POSTGRES_URL,
    echo=False,          # Set True for SQL debug logs
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Declarative base for all SQLAlchemy ORM models."""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a transactional async DB session.
    The session is automatically committed on success and rolled back on error.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Create all tables (used on app startup)."""
    # Import models here to ensure they are registered on the metadata
    from models import User, Challenge, Leaderboard  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ---------------------------------------------------------------------------
# Redis – Async Connection Pool & Client
# ---------------------------------------------------------------------------
_redis_pool: ConnectionPool = ConnectionPool.from_url(
    REDIS_URL,
    encoding="utf-8",
    decode_responses=True,  # All values come back as str
    max_connections=50,
)


async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    FastAPI dependency that yields a Redis client backed by a shared pool.
    The client is closed (released back to pool) after each request.
    """
    client: Redis = Redis(connection_pool=_redis_pool)
    try:
        yield client
    finally:
        await client.aclose()


# ---------------------------------------------------------------------------
# Convenience helpers (used in game_logic.py)
# ---------------------------------------------------------------------------
async def redis_set_json(redis: Redis, key: str, value: dict, ttl: int = 3600) -> None:
    """Serialize *value* to JSON and store it in Redis with an optional TTL (seconds)."""
    await redis.set(key, json.dumps(value), ex=ttl)


async def redis_get_json(redis: Redis, key: str) -> dict | None:
    """Retrieve a JSON-encoded value from Redis. Returns None if the key is absent."""
    raw = await redis.get(key)
    if raw is None:
        return None
    return json.loads(raw)
