from __future__ import annotations

import json
import logging
import os
from models.schemas import VocabularyEntry

logger = logging.getLogger(__name__)

FALLBACK_VOCABULARY = [
    "ini", "itu", "ada", "tidak", "ya", "dan", "di", "ke", "dari", "yang",
    "saya", "kamu", "dia", "kita", "mereka", "makan", "minum", "pergi",
    "lihat", "beli", "rumah", "jalan", "air", "makanan", "orang",
    "besar", "kecil", "bagus", "baru", "lama",
]

# Global in-memory vocabulary cache: word -> VocabularyEntry
vocab_cache: dict[str, VocabularyEntry] = {}


def load_vocab_cache() -> None:
    """Load vocabulary from data/id_vocabulary.json into memory.
    Falls back to FALLBACK_VOCABULARY if file is missing or malformed.
    """
    global vocab_cache
    vocab_path = os.path.join("data", "id_vocabulary.json")

    try:
        with open(vocab_path, encoding="utf-8") as f:
            raw = json.load(f)

        loaded = 0
        for entry in raw:
            try:
                vocab_entry = VocabularyEntry(**entry)
                vocab_cache[vocab_entry.word] = vocab_entry
                loaded += 1
            except Exception as e:
                logger.warning(f"Skipping malformed vocab entry {entry}: {e}")

        logger.info(f"Vocabulary cache loaded: {loaded} words from {vocab_path}")

    except FileNotFoundError:
        logger.warning(
            f"Vocabulary file not found at {vocab_path} — using fallback vocabulary"
        )
        _load_fallback()
    except json.JSONDecodeError as e:
        logger.warning(f"Vocabulary file malformed: {e} — using fallback vocabulary")
        _load_fallback()


def _load_fallback() -> None:
    """Populate vocab_cache with hardcoded fallback words."""
    global vocab_cache
    for word in FALLBACK_VOCABULARY:
        vocab_cache[word] = VocabularyEntry(
            word=word,
            pos="unknown",
            cefr_level="A1",
            translation_zh=word,
            translation_en=word,
            example_sentence=f"Saya suka {word}.",
        )
    logger.info(f"Fallback vocabulary loaded: {len(FALLBACK_VOCABULARY)} words")


def get_vocab_entry(word: str) -> VocabularyEntry | None:
    """Look up a word in the cache. Returns None if not found."""
    return vocab_cache.get(word)


def is_known_word(word: str) -> bool:
    """Check if a word exists in the vocabulary cache."""
    return word in vocab_cache
