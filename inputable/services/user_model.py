from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_models import User, UserWordStatus

logger = logging.getLogger(__name__)

# ── Placement test constants ──────────────────────────────────────────────────
PLACEMENT_WORDS = {
    "A1": ["makan", "rumah", "besar", "pergi"],
    "A2": ["sudah", "sedang", "kalau", "karena"],
    "B1": ["meskipun", "sehingga"],
}

VALID_CEFR = {"A1", "A2", "B1"}

# ── CEFR upgrade thresholds ───────────────────────────────────────────────────
CEFR_UPGRADE_THRESHOLDS = {
    "A1": ("A2", 8),   # A1 → A2 when learned+mastered >= 8
    "A2": ("B1", 20),  # A2 → B1 when learned+mastered >= 20
}


# ── User helpers ──────────────────────────────────────────────────────────────

async def get_or_create_user(user_id: str, db: AsyncSession) -> User:
    """Fetch user by ID or auto-create with CEFR=A1."""
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(user_id=user_id, estimated_cefr="A1")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info(f"Auto-created user: {user_id}")
    return user


async def get_learned_vocabulary(user_id: str, db: AsyncSession) -> list[str]:
    """Return words with status 'learned' or 'mastered', ordered by last_seen_at DESC."""
    result = await db.execute(
        select(UserWordStatus.word)
        .where(
            UserWordStatus.user_id == user_id,
            UserWordStatus.status.in_(["learned", "mastered"]),
        )
        .order_by(UserWordStatus.last_seen_at.desc())
    )
    return [row[0] for row in result.fetchall()]


# ── FSRS update ───────────────────────────────────────────────────────────────

async def get_or_create_word_status(
    user_id: str, word: str, db: AsyncSession
) -> UserWordStatus:
    """Fetch or create a UserWordStatus record."""
    result = await db.execute(
        select(UserWordStatus).where(
            UserWordStatus.user_id == user_id,
            UserWordStatus.word == word,
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        record = UserWordStatus(
            user_id=user_id,
            word=word,
            status="learning",
            interval=1,
            ease_factor=2.5,
        )
        db.add(record)
        await db.flush()
    return record


def apply_fsrs_update(record: UserWordStatus, is_correct: bool) -> UserWordStatus:
    """Apply simplified FSRS update rules in-place. Does not commit."""
    if is_correct:
        new_interval = int(record.interval * record.ease_factor)
        new_ease = min(record.ease_factor + 0.1, 3.0)
    else:
        new_interval = 1
        new_ease = max(record.ease_factor - 0.2, 1.3)

    if new_interval >= 21:
        new_status = "mastered"
    elif new_interval >= 7:
        new_status = "learned"
    else:
        new_status = "learning"

    record.interval = new_interval
    record.ease_factor = round(new_ease, 2)
    record.status = new_status
    record.last_seen_at = datetime.utcnow()
    record.next_review_at = datetime.utcnow() + timedelta(days=new_interval)
    return record


# ── CEFR auto-upgrade ─────────────────────────────────────────────────────────

async def maybe_upgrade_cefr(user_id: str, db: AsyncSession) -> str | None:
    """Check if user qualifies for CEFR upgrade. Returns new level or None."""
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        return None

    upgrade_info = CEFR_UPGRADE_THRESHOLDS.get(user.estimated_cefr)
    if upgrade_info is None:
        return None  # Already at B1 or unknown level

    new_cefr, threshold = upgrade_info

    count_result = await db.execute(
        select(func.count(UserWordStatus.id)).where(
            UserWordStatus.user_id == user_id,
            UserWordStatus.status.in_(["learned", "mastered"]),
        )
    )
    count = count_result.scalar_one()

    if count >= threshold:
        user.estimated_cefr = new_cefr
        await db.commit()
        logger.info(f"User {user_id} upgraded to {new_cefr} ({count} learned words)")
        return new_cefr

    return None


# ── Placement test ────────────────────────────────────────────────────────────

def compute_cefr(known_words: list[str]) -> str:
    """Compute CEFR level from placement test results.
    Empty list returns 'A1' (skip-test path).
    """
    known = set(known_words)
    a1_score = sum(1 for w in PLACEMENT_WORDS["A1"] if w in known)
    a2_score = sum(1 for w in PLACEMENT_WORDS["A2"] if w in known)
    b1_score = sum(1 for w in PLACEMENT_WORDS["B1"] if w in known)

    if a1_score >= 3 and a2_score >= 2 and b1_score >= 1:
        return "B1"
    elif a1_score >= 3 and a2_score >= 2:
        return "A2"
    else:
        return "A1"


async def seed_known_words(
    user_id: str, known_words: list[str], db: AsyncSession
) -> int:
    """Bulk-insert known_words into user_word_status as 'learned'.
    Skips words that already have a record. Returns count of seeded words.
    """
    seeded = 0
    for word in known_words:
        existing = await db.execute(
            select(UserWordStatus).where(
                UserWordStatus.user_id == user_id,
                UserWordStatus.word == word,
            )
        )
        if existing.scalar_one_or_none() is None:
            record = UserWordStatus(
                user_id=user_id,
                word=word,
                status="learned",
                interval=7,
                ease_factor=2.5,
            )
            db.add(record)
            seeded += 1
    await db.commit()
    return seeded
