import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import (
    SessionListItem,
    SessionListResponse,
    SessionDetail,
    CompleteSessionResponse,
    Annotation,
    NewWord,
    OutputTask,
    UpdateSessionRequest,
    DeleteSessionResponse,
)
from models.db_models import LearningSession
from database import get_db
from services.image_utils import get_or_create_thumbnail

logger = logging.getLogger(__name__)
router = APIRouter()

IMAGE_DIR = os.getenv("IMAGE_DIR", "images")
BASE_URL = os.getenv("BASE_URL", "http://localhost:7860")


def build_image_url(session_id: str) -> str:
    return f"{BASE_URL}/images/{session_id}_rendered.png"


def build_original_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    filename = os.path.basename(image_path)
    return f"{BASE_URL}/images/{filename}"


def build_thumbnail_url(thumbnail_path: str | None) -> str | None:
    if not thumbnail_path:
        return None
    filename = os.path.basename(thumbnail_path)
    return f"{BASE_URL}/images/{filename}"


@router.get("/api/sessions", response_model=SessionListResponse)
async def list_sessions(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession)
        .where(LearningSession.user_id == user_id)
        .order_by(LearningSession.created_at.desc())
    )
    sessions = result.scalars().all()

    items = []
    for session in sessions:
        caption = None
        if session.generated_content:
            caption = session.generated_content.get("caption", "")

        # Generate or get thumbnail for the original AI-generated image
        thumbnail_path = None
        if session.image_path:
            thumb_file = get_or_create_thumbnail(session.image_path)
            thumbnail_path = build_thumbnail_url(thumb_file)

        items.append(
            SessionListItem(
                session_id=session.session_id,
                user_id=session.user_id,
                image_path=build_original_image_url(session.image_path),
                rendered_image_path=build_image_url(session.session_id) if session.rendered_image_path else None,
                thumbnail_path=thumbnail_path,
                caption=caption,
                new_vocab=session.new_vocab or [],
                output_task=session.output_task,
                user_output=session.user_output,
                feedback=session.feedback,
                completed=session.completed or False,
                created_at=session.created_at.isoformat() if session.created_at else "",
            )
        )

    return SessionListResponse(sessions=items, total=len(items))


@router.get("/api/sessions/{session_id}", response_model=SessionDetail)
async def get_session_detail(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession).where(LearningSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    caption = None
    annotations = []
    output_task = None

    if session.generated_content:
        caption = session.generated_content.get("caption", "")
        raw_annotations = session.generated_content.get("annotations", [])
        annotations = [
            Annotation(
                object=ann.get("object", ""),
                label=ann.get("label", ""),
                new_words=[
                    NewWord(
                        word=nw.get("word", ""),
                        translation_zh=nw.get("translation_zh", ""),
                        translation_en=nw.get("translation_en", ""),
                    )
                    for nw in ann.get("new_words", [])
                ],
            )
            for ann in raw_annotations
        ]

        task_raw = session.generated_content.get("output_task", {})
        if task_raw:
            output_task = OutputTask(
                type=task_raw.get("type", "fill_blank"),
                prompt=task_raw.get("prompt", ""),
                answer=task_raw.get("answer", ""),
            )

    return SessionDetail(
        session_id=session.session_id,
        user_id=session.user_id,
        image_path=build_original_image_url(session.image_path),
        rendered_image_path=build_image_url(session.session_id) if session.rendered_image_path else None,
        generated_content=session.generated_content,
        caption=caption,
        annotations=annotations,
        new_vocab=session.new_vocab or [],
        output_task=output_task,
        user_output=session.user_output,
        feedback=session.feedback,
        completed=session.completed or False,
        created_at=session.created_at.isoformat() if session.created_at else "",
    )


@router.post("/api/sessions/{session_id}/complete", response_model=CompleteSessionResponse)
async def complete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession).where(LearningSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    session.completed = True
    await db.commit()

    return CompleteSessionResponse(
        session_id=session_id,
        completed=True,
        message="Session marked as completed",
    )


@router.delete("/api/sessions/{session_id}", response_model=DeleteSessionResponse)
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession).where(LearningSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    image_files_to_delete = []
    if session.image_path:
        image_files_to_delete.append(session.image_path)
    if session.rendered_image_path:
        image_files_to_delete.append(session.rendered_image_path)

    await db.delete(session)
    await db.commit()

    deleted_files = []
    for file_path in image_files_to_delete:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                deleted_files.append(file_path)
                logger.info(f"Deleted image file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to delete image file {file_path}: {e}")

    return DeleteSessionResponse(
        session_id=session_id,
        deleted=True,
        message=f"Session deleted successfully. Removed {len(deleted_files)} image files.",
    )


@router.patch("/api/sessions/{session_id}", response_model=SessionDetail)
async def update_session(
    session_id: str,
    request: UpdateSessionRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession).where(LearningSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    if request.completed is not None:
        session.completed = request.completed

    if request.caption is not None or request.annotations is not None:
        if session.generated_content is None:
            session.generated_content = {}

        if request.caption is not None:
            session.generated_content["caption"] = request.caption

        if request.annotations is not None:
            session.generated_content["annotations"] = [
                {
                    "object": ann.object,
                    "label": ann.label,
                    "new_words": [
                        {
                            "word": nw.word,
                            "translation_zh": nw.translation_zh,
                            "translation_en": nw.translation_en,
                        }
                        for nw in ann.new_words
                    ],
                }
                for ann in request.annotations
            ]

    await db.commit()
    await db.refresh(session)

    caption = None
    annotations = []
    output_task = None

    if session.generated_content:
        caption = session.generated_content.get("caption", "")
        raw_annotations = session.generated_content.get("annotations", [])
        annotations = [
            Annotation(
                object=ann.get("object", ""),
                label=ann.get("label", ""),
                new_words=[
                    NewWord(
                        word=nw.get("word", ""),
                        translation_zh=nw.get("translation_zh", ""),
                        translation_en=nw.get("translation_en", ""),
                    )
                    for nw in ann.get("new_words", [])
                ],
            )
            for ann in raw_annotations
        ]

        task_raw = session.generated_content.get("output_task", {})
        if task_raw:
            output_task = OutputTask(
                type=task_raw.get("type", "fill_blank"),
                prompt=task_raw.get("prompt", ""),
                answer=task_raw.get("answer", ""),
            )

    return SessionDetail(
        session_id=session.session_id,
        user_id=session.user_id,
        image_path=build_original_image_url(session.image_path),
        rendered_image_path=build_image_url(session.session_id) if session.rendered_image_path else None,
        generated_content=session.generated_content,
        caption=caption,
        annotations=annotations,
        new_vocab=session.new_vocab or [],
        output_task=output_task,
        user_output=session.user_output,
        feedback=session.feedback,
        completed=session.completed or False,
        created_at=session.created_at.isoformat() if session.created_at else "",
    )
