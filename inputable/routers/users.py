import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.schemas import CreateUserRequest, UserResponse
from models.db_models import User, UserWordStatus

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_CEFR = {"A1", "A2", "B1"}


def _get_db():
    from main import get_db
    return get_db


@router.post("/api/users", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    db: AsyncSession = Depends(_get_db()),
):
    if request.cefr not in VALID_CEFR:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid CEFR level '{request.cefr}'. Must be one of: A1, A2, B1",
        )

    user_id = request.user_id or str(uuid.uuid4())

    # Check if already exists
    result = await db.execute(select(User).where(User.user_id == user_id))
    existing = result.scalar_one_or_none()
    if existing:
        # Return existing user info
        count_result = await db.execute(
            select(func.count(UserWordStatus.id)).where(
                UserWordStatus.user_id == user_id,
                UserWordStatus.status.in_(["learned", "mastered"]),
            )
        )
        count = count_result.scalar_one()
        return UserResponse(
            user_id=existing.user_id,
            estimated_cefr=existing.estimated_cefr,
            learned_word_count=count,
        )

    user = User(user_id=user_id, estimated_cefr=request.cefr)
    db.add(user)
    await db.commit()
    logger.info(f"Created user {user_id} with CEFR={request.cefr}")

    return UserResponse(user_id=user_id, estimated_cefr=request.cefr, learned_word_count=0)


@router.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(_get_db()),
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail={"error": "user not found"})

    count_result = await db.execute(
        select(func.count(UserWordStatus.id)).where(
            UserWordStatus.user_id == user_id,
            UserWordStatus.status.in_(["learned", "mastered"]),
        )
    )
    count = count_result.scalar_one()

    return UserResponse(
        user_id=user.user_id,
        estimated_cefr=user.estimated_cefr,
        learned_word_count=count,
    )
