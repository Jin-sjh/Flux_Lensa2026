import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import VocabularyItem, VocabularyListResponse
from models.db_models import UserWordStatus
from services.vocab_cache import get_vocab_entry
from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/vocabulary", response_model=VocabularyListResponse)
async def list_vocabulary(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserWordStatus)
        .where(UserWordStatus.user_id == user_id)
        .order_by(UserWordStatus.last_seen_at.desc())
    )
    word_statuses = result.scalars().all()

    items = []
    for ws in word_statuses:
        vocab_entry = get_vocab_entry(ws.word)
        translation_zh = None
        translation_en = None

        if vocab_entry:
            translation_zh = vocab_entry.translation_zh
            translation_en = vocab_entry.translation_en

        items.append(
            VocabularyItem(
                word=ws.word,
                status=ws.status,
                translation_zh=translation_zh,
                translation_en=translation_en,
                last_seen_at=ws.last_seen_at.isoformat() if ws.last_seen_at else None,
                next_review_at=ws.next_review_at.isoformat() if ws.next_review_at else None,
                interval=ws.interval,
                ease_factor=ws.ease_factor,
            )
        )

    return VocabularyListResponse(vocabulary=items, total=len(items))
