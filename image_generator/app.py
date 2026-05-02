import os
import uuid
import asyncio
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI(title="Lensa - AI Image Annotator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
RESULT_DIR = BASE_DIR / "results"
UPLOAD_DIR.mkdir(exist_ok=True)
RESULT_DIR.mkdir(exist_ok=True)

app.mount("/results", StaticFiles(directory=str(RESULT_DIR)), name="results")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

tasks_status: dict = {}


@app.get("/", response_class=HTMLResponse)
async def index():
    html_path = BASE_DIR / "static" / "index.html"
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))


@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    ext = Path(file.filename or "image.jpg").suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        raise HTTPException(status_code=400, detail="Unsupported image format")

    task_id = uuid.uuid4().hex[:12]
    filename = f"{task_id}{ext}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"task_id": task_id, "filename": filename, "filepath": str(filepath)}


@app.post("/api/annotate/{task_id}")
async def start_annotation(task_id: str):
    upload_files = list(UPLOAD_DIR.glob(f"{task_id}*"))
    if not upload_files:
        raise HTTPException(status_code=404, detail="Image not found")

    image_path = str(upload_files[0])
    tasks_status[task_id] = {"status": "processing", "step": "recognizing", "progress": 10, "message": "Recognizing image..."}

    asyncio.create_task(run_annotation(task_id, image_path))

    return {"task_id": task_id, "status": "processing"}


async def run_annotation(task_id: str, image_path: str):
    try:
        from image_annotator import load_vocabulary, annotate_image
        from image_recognizer import recognize_image

        tasks_status[task_id] = {"status": "processing", "step": "recognizing", "progress": 15, "message": "Loading vocabulary..."}

        vocab_text = load_vocabulary()

        tasks_status[task_id] = {"status": "processing", "step": "recognizing", "progress": 25, "message": "Recognizing image with GPT-4o..."}

        recognition_prompt = (
            "Please carefully observe this photo and list ALL visible items, food, drinks, and scene elements. "
            "For each item, write a short Indonesian diary-style annotation AND its Chinese translation following these rules:\n"
            "- Drinks: describe taste/temperature/mood in Indonesian\n"
            "- Food: describe texture/deliciousness in Indonesian\n"
            "- Scene/objects: describe atmosphere in Indonesian\n"
            "- Each Indonesian annotation MUST be exactly 4-5 Indonesian words only, very short and simple\n"
            "- Keep it kawaii casual style\n"
            "- End with one overall mood summary sentence (also 4-5 words only)\n"
            "- Use only natural spoken Indonesian\n"
            "- Keep it soft, cute, diary-like\n"
            "Format each line as: [item name in Indonesian]: [4-5 word annotation] | [Chinese translation]\n"
            "\n"
            "VOCABULARY REFERENCE:\n"
            "Please try to use words from this vocabulary list as much as possible. "
            "This is a reference, not a strict ban on other words, but prefer these words:\n"
            f"{vocab_text}"
        )

        loop = asyncio.get_event_loop()
        annotations = await loop.run_in_executor(None, recognize_image, image_path, recognition_prompt)

        tasks_status[task_id] = {"status": "processing", "step": "annotating", "progress": 55, "message": "Generating annotated image with GPT-Image-2...", "annotations": annotations}

        output_path = str(RESULT_DIR / f"{task_id}_annotated.png")
        result_path = await loop.run_in_executor(None, annotate_image, image_path, annotations, output_path)

        tasks_status[task_id] = {
            "status": "completed",
            "step": "done",
            "progress": 100,
            "message": "Done!",
            "annotations": annotations,
            "result_url": f"/results/{task_id}_annotated.png",
            "original_url": f"/uploads/{Path(image_path).name}",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        }

    except Exception as e:
        tasks_status[task_id] = {"status": "error", "step": "failed", "progress": 0, "message": str(e)}


@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks_status:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_status[task_id]


@app.get("/api/history")
async def get_history():
    results = []
    for f in sorted(RESULT_DIR.glob("*.png"), key=lambda x: x.stat().st_mtime, reverse=True):
        task_id = f.stem.replace("_annotated", "")
        orig_files = list(UPLOAD_DIR.glob(f"{task_id}*"))
        file_time = datetime.fromtimestamp(f.stat().st_mtime)
        entry = {
            "task_id": task_id,
            "result_url": f"/results/{f.name}",
            "original_url": f"/uploads/{orig_files[0].name}" if orig_files else None,
            "created_at": file_time.strftime("%Y-%m-%d %H:%M"),
        }
        if task_id in tasks_status:
            if "annotations" in tasks_status[task_id]:
                entry["annotations"] = tasks_status[task_id]["annotations"]
            if "created_at" in tasks_status[task_id]:
                entry["created_at"] = tasks_status[task_id]["created_at"]
        results.append(entry)
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
