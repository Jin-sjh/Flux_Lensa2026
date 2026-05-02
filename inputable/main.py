import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from dotenv import load_dotenv

load_dotenv()

from config import IMAGE_DIR, ANKI_DIR, DEMO_DIR, DATA_ROOT, HOST, PORT, CORS_ORIGINS, DEMO_USER_EMAIL, DEMO_USER_PASSWORD
from models.db_models import Base, User
from services.vocab_cache import load_vocab_cache
from services.llm_factory import LLMFactory
from services.auth_service import hash_password
from database import engine, AsyncSessionLocal, get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Lensa backend...")

    try:
        LLMFactory.initialize()
        logger.info("LLM Factory initialized successfully")
        
        if not LLMFactory.is_anthropic_available():
            logger.warning("Anthropic client not available — Sonnet calls will fail")
        if not LLMFactory.is_openai_available():
            logger.warning("OpenAI client not available — Image generation will fail")
    except Exception as e:
        logger.error(f"Failed to initialize LLM Factory: {e}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == DEMO_USER_EMAIL)
        )
        if not result.scalar_one_or_none():
            demo_user = User(
                email=DEMO_USER_EMAIL,
                name="Demo User",
                password_hash=hash_password(DEMO_USER_PASSWORD),
                estimated_cefr="A1",
                has_completed_test=False,
            )
            session.add(demo_user)
            await session.commit()
            logger.info(f"Default demo account created: {DEMO_USER_EMAIL}")

    load_vocab_cache()

    os.makedirs(DATA_ROOT, exist_ok=True)
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(ANKI_DIR, exist_ok=True)
    os.makedirs(DEMO_DIR, exist_ok=True)
    os.makedirs(os.path.join(DATA_ROOT, "data"), exist_ok=True)

    yield

    await engine.dispose()
    logger.info("Lensa backend shut down")

app = FastAPI(title="Lensa Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(IMAGE_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")

from routers import generate, render, evaluate, export_anki, placement, auth, sessions, vocabulary

app.include_router(generate.router)
app.include_router(render.router)
app.include_router(evaluate.router)
app.include_router(export_anki.router)
app.include_router(placement.router)
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(vocabulary.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal server error", "detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )
