import os

RENDER_DATA_DIR = os.getenv("RENDER_DATA_DIR", "")
DATA_ROOT = RENDER_DATA_DIR if RENDER_DATA_DIR else "."

IMAGE_DIR = os.getenv("IMAGE_DIR", os.path.join(DATA_ROOT, "images"))
ANKI_DIR = os.getenv("ANKI_DIR", os.path.join(DATA_ROOT, "anki"))
DEMO_DIR = os.getenv("DEMO_DIR", os.path.join(DATA_ROOT, "demo"))

BASE_URL = os.getenv("BASE_URL", "http://localhost:7860")

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "7860"))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
    if origin.strip()
]

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{os.path.join(DATA_ROOT, 'app.db')}")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "168"))

DEMO_RENDER_DELAY = float(os.getenv("DEMO_RENDER_DELAY", "1.5"))
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

DEMO_USER_EMAIL = os.getenv("DEMO_USER_EMAIL", "demo@lensa.example.com")
DEMO_USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "123456")

VOCAB_PATH = os.getenv("VOCAB_PATH", os.path.join(DATA_ROOT, "data", "id_vocabulary.json"))
