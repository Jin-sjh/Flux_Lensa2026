import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_models import User
from models.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UpdateLevelRequest,
    UserResponse,
)
from services.auth_service import create_access_token, hash_password, verify_password, decode_token
from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="无效的认证令牌")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="无效的认证令牌")

    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user


def _user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.user_id,
        email=user.email or "",
        name=user.name or "",
        cefrLevel=user.estimated_cefr,
        hasCompletedTest=user.has_completed_test,
        createdAt=user.created_at.isoformat() if user.created_at else "",
    )


@router.post("/api/auth/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.email == request.email.lower().strip())
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")

    if not user.password_hash or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="密码错误")

    token = create_access_token({"sub": user.user_id, "email": user.email})

    logger.info("User logged in: %s", user.email)

    return AuthResponse(
        user=_user_to_response(user),
        token=token,
    )


@router.post("/api/auth/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    email = request.email.lower().strip()

    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="该邮箱已被注册")

    user = User(
        email=email,
        name=request.name.strip(),
        password_hash=hash_password(request.password),
        estimated_cefr="A1",
        has_completed_test=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.user_id, "email": user.email})

    logger.info("New user registered: %s", user.email)

    return AuthResponse(
        user=_user_to_response(user),
        token=token,
    )


@router.patch("/api/user/level", response_model=UserResponse)
async def update_user_level(
    request: UpdateLevelRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.user_id != request.userId:
        raise HTTPException(status_code=403, detail="无权修改其他用户信息")

    result = await db.execute(select(User).where(User.user_id == request.userId))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.estimated_cefr = request.cefrLevel
    user.has_completed_test = True
    await db.commit()
    await db.refresh(user)

    logger.info("User %s level updated to %s", user.user_id, request.cefrLevel)

    return _user_to_response(user)
