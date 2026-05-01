# Lensa Backend

FastAPI backend for the Lensa Indonesian language learning app.

## Quick Start (Docker)

```bash
# 1. Copy and fill in your API keys
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY and OPENAI_API_KEY

# 2. Build and start
docker-compose up --build

# 3. In a separate terminal, expose backend via ngrok
ngrok http 7860

# 4. Update BASE_URL in .env with your ngrok address
# e.g. BASE_URL=https://abc123.ngrok.io
# Then restart: docker-compose restart backend
```

## Quick Start (Local)

```bash
cd inputable
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys

uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/users | Create user |
| GET | /api/users/{user_id} | Get user info |
| POST | /api/placement_test | Cold-start CEFR placement |
| POST | /api/generate | Generate annotations from photo |
| GET | /api/render | Generate annotated card image |
| POST | /api/evaluate | Evaluate fill-in-the-blank answer |
| GET | /api/export_anki | Download Anki .apkg deck |

## Running Tests

```bash
cd inputable
pytest tests/ -v
```

## Windows Notes

- Docker Desktop requires WSL2 backend enabled
- Volumes use relative paths — Docker Compose handles Windows path conversion
- Never commit `.env` to git

## ngrok Setup

After `docker-compose up --build`:
```bash
ngrok http 7860
# Copy the https://xxx.ngrok.io URL
# Update BASE_URL in .env
# docker-compose restart backend
```

Jianhao: set `API_BASE = "https://xxx.ngrok.io"` in `gradio_app.py`.
