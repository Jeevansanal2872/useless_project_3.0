"""
main.py
-------
FastAPI application entry point for Illam Chuttu Eliye Kolluka.

Startup sequence
----------------
1. Create all PostgreSQL tables (idempotent via CREATE IF NOT EXISTS).
2. Mount all API routes.
3. Attach exception handlers for GameOver and validation errors.

Run locally
-----------
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routes import router

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("illam_chuttu")


# ---------------------------------------------------------------------------
# Application lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks before serving requests, and cleanup on shutdown."""
    logger.info("🔥 Illam Chuttu Eliye Kolluka – backend starting up …")
    await init_db()
    logger.info("✅ Database tables initialised.")
    yield
    logger.info("🛑 Backend shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Illam Chuttu Eliye Kolluka API",
    description=(
        "Backend for the 2D top-down game 'Burn the House to Kill the Rat'. "
        "Players chase a rat, solve Python debugging challenges under a strict "
        "5-minute timer, and compete on a global leaderboard."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS (allow all origins in development – restrict in production)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # TODO: lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(router)


# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Intercept HTTP 410 (GAME_OVER) responses and give them a distinct shape
    so the frontend can easily detect and handle them.
    """
    if exc.status_code == status.HTTP_410_GONE:
        return JSONResponse(
            status_code=status.HTTP_410_GONE,
            content={
                "code": "GAME_OVER",
                "detail": exc.detail if isinstance(exc.detail, str) else exc.detail,
            },
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception for %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal error occurred."},
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["meta"], summary="Health check")
async def health_check() -> dict:
    return {"status": "ok", "game": "Illam Chuttu Eliye Kolluka"}
