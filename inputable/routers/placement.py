import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import PlacementTestRequest, PlacementTestResponse
from models.db_models import User
from services.user_model import (
    get_or_create_user,
    compute_cefr,
    seed_known_words,
)
from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/placement_test", response_model=PlacementTestResponse)
async def placement_test(
    request: PlacementTestRequest,
    db: AsyncSession = Depends(get_db),
):
    # Get or create user
    user = await get_or_create_user(request.user_id, db)

    # Compute CEFR from known words (empty list → A1)
    estimated_cefr = compute_cefr(request.known_words)

    # Update user's CEFR
    user.estimated_cefr = estimated_cefr
    await db.commit()

    # Seed known words into user_word_status as "learned"
    seeded = await seed_known_words(request.user_id, request.known_words, db)

    logger.info(
        f"Placement test for {request.user_id}: "
        f"CEFR={estimated_cefr}, seeded={seeded} words"
    )

    return PlacementTestResponse(
        estimated_cefr=estimated_cefr,
        learned_words_seeded=seeded,
    )
