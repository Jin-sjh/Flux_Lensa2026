import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from dotenv import load_dotenv

from models.db_models import Base
from services.vocab_cache import load_vocab_cache

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Environment ───────────────────────────────────────────────────────────────
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")
IMAGE_DIR = os.getenv("IMAGE_DIR", "images")
ANKI_DIR = os.getenv("ANKI_DIR", "anki")
BASE_URL = os.getenv("BASE_URL", "http://localhost:7860")

# ── Database ──────────────────────────────────────────────────────────────────
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Lensa backend...")

    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.warning("ANTHROPIC_API_KEY not set — Sonnet calls will fail")
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not set — Image generation will fail")

    # Create DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    # Load vocabulary into memory
    load_vocab_cache()

    # Ensure required directories exist
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(ANKI_DIR, exist_ok=True)

    yield

    await engine.dispose()
    logger.info("Lensa backend shut down")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Lensa Backend", version="1.0.0", lifespan=lifespan)

# Static file serving for generated images
os.makedirs(IMAGE_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")

# ── Routers ───────────────────────────────────────────────────────────────────
from routers import generate, render, evaluate, export_anki, users, placement

app.include_router(generate.router)
app.include_router(render.router)
app.include_router(evaluate.router)
app.include_router(export_anki.router)
app.include_router(users.router)
app.include_router(placement.router)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal server error", "detail": str(exc)},
    )
