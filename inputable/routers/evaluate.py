import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import EvaluateRequest, EvaluateResponse
from models.db_models import LearningSession
from services.user_model import (
    get_or_create_word_status,
    apply_fsrs_update,
    maybe_upgrade_cefr,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_db():
    from main import get_db
    return get_db


@router.post("/api/evaluate", response_model=EvaluateResponse)
async def evaluate(
    request: EvaluateRequest,
    db: AsyncSession = Depends(_get_db()),
):
    # 1. Fetch session
    result = await db.execute(
        select(LearningSession).where(
            LearningSession.session_id == request.session_id
        )
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail={"error": "session not found"})

    # 2. Compare answer (case-insensitive, whitespace-stripped)
    output_task = session.output_task or {}
    expected = output_task.get("answer", "").strip().lower()
    user_ans = request.user_output.strip().lower()
    is_correct = user_ans == expected

    # 3. Apply FSRS update for each new word
    new_vocab = session.new_vocab or []
    words_updated = []
    for item in new_vocab:
        word = item if isinstance(item, str) else item.get("word", "")
        if not word:
            continue
        record = await get_or_create_word_status(session.user_id, word, db)
        apply_fsrs_update(record, is_correct)
        words_updated.append(word)

    # 4. Update session fields
    session.user_output = request.user_output
    session.feedback = {
        "is_correct": is_correct,
        "expected": expected,
        "user_answer": user_ans,
    }

    await db.commit()

    # 5. Check for CEFR upgrade
    cefr_upgraded = await maybe_upgrade_cefr(session.user_id, db)

    # 6. Build feedback message
    if is_correct:
        feedback = f"Benar! ✅ 你正确使用了「{expected}」。"
    else:
        feedback = f"再想想 ❌ 正确答案是「{expected}」，你写的是「{user_ans}」。"

    if cefr_upgraded:
        feedback += f" 🎉 恭喜升级到 {cefr_upgraded}！"

    return EvaluateResponse(
        is_correct=is_correct,
        feedback=feedback,
        words_updated=words_updated,
        cefr_upgraded=cefr_upgraded,
    )
