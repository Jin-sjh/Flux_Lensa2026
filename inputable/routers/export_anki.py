import logging
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_models import User
from services.anki_builder import build_deck
from database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/export_anki")
async def export_anki(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    # Verify user exists
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail={"error": "user not found"})

    apkg_path = await build_deck(user_id, db)

    if not os.path.exists(apkg_path):
        raise HTTPException(status_code=500, detail={"error": "failed to generate deck"})

    return FileResponse(
        path=apkg_path,
        media_type="application/octet-stream",
        filename="lensa_deck.apkg",
        headers={"Content-Disposition": "attachment; filename=lensa_deck.apkg"},
    )
