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
        {"name": "TranslationZH"},
        {"name": "TranslationEN"},
        {"name": "Example"},
        {"name": "Image"},
        {"name": "CEFR"},
        {"name": "POS"},
    ],
    templates=[
        {
            "name": "Card 1",
            "qfmt": "{{Image}}<br><div style='text-align:center;font-size:24px;color:#2c3e50;margin-top:10px'>{{Word}}</div>",
            "afmt": (
                "{{FrontSide}}"
                "<hr style='border:1px solid #ecf0f1;margin:20px 0'>"
                "<div style='text-align:center;font-size:20px;color:#e74c3c'>"
                "{{TranslationZH}}</div>"
                "<div style='text-align:center;font-size:16px;color:#3498db'>"
                "{{TranslationEN}}</div>"
                "<hr style='border:1px solid #ecf0f1;margin:10px 0'>"
                "<div style='text-align:center;font-size:14px;color:#555;"
                "font-style:italic'>{{Example}}</div>"
                "<div style='text-align:center;font-size:12px;color:#7f8c8d;margin-top:10px'>"
                "CEFR: {{CEFR}} | POS: {{POS}}</div>"
            ),
        }
    ],
)


def _build_word_lookup(generated_content: dict | None) -> dict[str, dict]:
    """Extract word→details map from generated_content.
    Returns: word -> {translation_zh, translation_en, example_label}
    """
    lookup: dict[str, dict] = {}
    if not generated_content:
        return lookup

    for ann in generated_content.get("annotations", []):
        label = ann.get("label", "")
        for nw in ann.get("new_words", []):
            w = nw.get("word", "")
            if w and w not in lookup:
                lookup[w] = {
                    "translation_zh": nw.get("translation_zh", ""),
                    "translation_en": nw.get("translation_en", ""),
                    "example_label": label,
                }
    return lookup


async def build_deck(user_id: str, db: AsyncSession) -> str:
    """Build an Anki .apkg deck for all new words across user's sessions.

    Priority: generated_content (Sonnet's live translations) > vocab_cache > fallback.
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

        # Build per-session word lookup from generated_content
        gen_lookup = _build_word_lookup(session.generated_content)

        # new_vocab is stored as list of dicts or list of strings
        for item in new_vocab:
            word = item if isinstance(item, str) else item.get("word", "")
            if not word or word in seen_words:
                continue
            seen_words.add(word)

            # ── Resolve translations: generated_content > vocab_cache > fallback ──
            gen_detail = gen_lookup.get(word)
            entry = get_vocab_entry(word)

            if gen_detail:
                # Sonnet-generated translations are most contextually accurate
                translation_zh = gen_detail["translation_zh"] or (
                    entry.translation_zh if entry else word
                )
                translation_en = gen_detail["translation_en"] or (
                    entry.translation_en if entry else word
                )
                example = gen_detail.get("example_label") or ""
                if not example and entry:
                    example = entry.example_sentence
                elif not example:
                    example = f"Saya suka {word}."
                cefr = entry.cefr_level if entry else "A1"
                pos = entry.pos if entry else "unknown"
            elif entry:
                translation_zh = entry.translation_zh
                translation_en = entry.translation_en
                example = entry.example_sentence
                cefr = entry.cefr_level
                pos = entry.pos
            else:
                translation_zh = word
                translation_en = word
                example = f"Saya suka {word}."
                cefr = "A1"
                pos = "unknown"

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
                fields=[word, translation_zh, translation_en, example, image_field, cefr, pos],
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
