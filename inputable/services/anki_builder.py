from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime

import genanki
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_models import AnkiExport, LearningSession
from services.vocab_cache import get_vocab_entry

logger = logging.getLogger(__name__)

ANKI_DIR = os.getenv("ANKI_DIR", "anki")

# Stable model/deck IDs (must not change between exports)
ANKI_MODEL_ID = 1607392319
ANKI_DECK_ID = 2059400110

ANKI_MODEL = genanki.Model(
    ANKI_MODEL_ID,
    "Lensa Card",
    fields=[
        {"name": "Word"},
        {"name": "Translation"},
        {"name": "Example"},
        {"name": "Image"},
    ],
    templates=[
        {
            "name": "Card 1",
            "qfmt": "{{Image}}",
            "afmt": (
                "{{FrontSide}}"
                "<hr style='border:1px solid #ecf0f1;margin:20px 0'>"
                "<div style='text-align:center;font-size:28px;color:#e74c3c'>"
                "{{Translation}}</div>"
                "<div style='text-align:center;font-size:16px;color:#555;"
                "font-style:italic'>{{Example}}</div>"
            ),
        }
    ],
)


async def build_deck(user_id: str, db: AsyncSession) -> str:
    """Build an Anki .apkg deck for all new words across user's sessions.
    Returns the file path of the written .apkg file.
    """
    os.makedirs(ANKI_DIR, exist_ok=True)

    # Fetch all sessions for this user
    result = await db.execute(
        select(LearningSession).where(LearningSession.user_id == user_id)
    )
    sessions = result.scalars().all()

    deck = genanki.Deck(ANKI_DECK_ID, "Lensa · 印尼语")
    media_files = []
    seen_words: set[str] = set()

    for session in sessions:
        new_vocab = session.new_vocab or []
        # new_vocab is stored as list of dicts or list of strings
        for item in new_vocab:
            word = item if isinstance(item, str) else item.get("word", "")
            if not word or word in seen_words:
                continue
            seen_words.add(word)

            # Look up vocab details from cache
            entry = get_vocab_entry(word)
            translation = entry.translation_zh if entry else word
            example = entry.example_sentence if entry else ""

            # Use rendered image if available, else original
            image_path = session.rendered_image_path or session.image_path
            image_field = ""
            if image_path and os.path.exists(image_path):
                img_filename = os.path.basename(image_path)
                image_field = f'<img src="{img_filename}">'
                if image_path not in media_files:
                    media_files.append(image_path)

            note = genanki.Note(
                model=ANKI_MODEL,
                fields=[word, translation, example, image_field],
            )
            deck.add_note(note)

    # Write .apkg
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    apkg_filename = f"{user_id}_{timestamp}.apkg"
    apkg_path = os.path.join(ANKI_DIR, apkg_filename)

    package = genanki.Package(deck)
    package.media_files = media_files
    package.write_to_file(apkg_path)
    logger.info(f"Anki deck written: {apkg_path} ({len(seen_words)} words)")

    # Record export in DB
    export_record = AnkiExport(
        export_id=str(uuid.uuid4()),
        user_id=user_id,
        session_ids=[s.session_id for s in sessions],
        apkg_path=apkg_path,
    )
    db.add(export_record)
    await db.commit()

    return apkg_path
