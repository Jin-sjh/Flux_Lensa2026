import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import GenerateRequest, GenerateResponse, Annotation, NewWord, OutputTask
from models.db_models import LearningSession
from services.sonnet_service import generate_annotations_with_fallback
from services.image_utils import save_uploaded_image
from services.user_model import get_or_create_user, get_learned_vocabulary

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_db():
    """Import here to avoid circular imports at module load time."""
    from main import get_db
    return get_db


@router.post("/api/generate", response_model=GenerateResponse)
async def generate(
    request: GenerateRequest,
    db: AsyncSession = Depends(_get_db()),
):
    # 1. Resolve user (auto-create if new)
    user = await get_or_create_user(request.user_id, db)
    cefr = user.estimated_cefr

    # 2. Save compressed image to disk
    try:
        image_path = save_uploaded_image(request.image, request.user_id)
    except Exception as e:
        logger.error(f"Failed to save image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")

    # 3. Load learned vocabulary for i+1 constraint
    learned_words = await get_learned_vocabulary(request.user_id, db)

    # 4. Call Sonnet (with retry + fallback)
    result = generate_annotations_with_fallback(request.image, cefr, learned_words)

    # 5. Parse result into typed objects
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
        for ann in result.get("annotations", [])
    ]

    caption = result.get("caption", "")
    task_raw = result.get("output_task", {})
    output_task = OutputTask(
        type="fill_blank",
        prompt=task_raw.get("prompt", ""),
        answer=task_raw.get("answer", ""),
    )

    # 6. Collect all new words (flat list of word strings)
    all_new_words = []
    for ann in annotations:
        for nw in ann.new_words:
            if nw.word and nw.word not in all_new_words:
                all_new_words.append(nw.word)

    # 7. Persist session to DB
    session_id = str(uuid.uuid4())
    try:
        session = LearningSession(
            session_id=session_id,
            user_id=request.user_id,
            image_path=image_path,
            generated_content=result,
            new_vocab=all_new_words,
            output_task=task_raw,
        )
        db.add(session)
        await db.commit()
    except Exception as e:
        logger.error(f"DB write failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "database error", "detail": str(e)},
        )

    return GenerateResponse(
        session_id=session_id,
        annotations=annotations,
        caption=caption,
        output_task=output_task,
    )
