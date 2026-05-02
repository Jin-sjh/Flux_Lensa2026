import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import RenderResponse, Annotation, NewWord
from models.db_models import LearningSession
from services.image_gen import render_card, build_image_url
from services.user_model import get_or_create_user
from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/render", response_model=RenderResponse)
async def render(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningSession).where(LearningSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    user = await get_or_create_user(session.user_id, db)
    cefr = user.estimated_cefr

    raw_annotations = []
    if session.generated_content:
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

    caption = ""
    if session.generated_content:
        caption = session.generated_content.get("caption", "")

    try:
        local_path = await render_card(
            annotations=[ann.model_dump() for ann in annotations],
            caption=caption,
            cefr=cefr,
            session_id=session_id,
            original_image_path=session.image_path,
        )

        session.rendered_image_path = local_path
        await db.commit()

        image_url = build_image_url(session_id)
        return RenderResponse(rendered_image_url=image_url)

    except Exception as e:
        logger.error(f"Image generation failed for session {session_id}: {e}")
        raise HTTPException(
            status_code=502,
            detail={"error": "image generation failed", "detail": str(e)},
        ) from e
