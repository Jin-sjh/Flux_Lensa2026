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


# ── Fallback vocabulary with proper translations ──────────────────────────
# Only used when data/id_vocabulary.json is missing or malformed.
_FALLBACK_DETAILS: dict[str, dict[str, str]] = {
    "ini":       {"pos": "pronoun", "translation_zh": "这",    "translation_en": "this",        "example": "Ini buku saya."},
    "itu":       {"pos": "pronoun", "translation_zh": "那",    "translation_en": "that",        "example": "Itu rumah dia."},
    "ada":       {"pos": "verb",    "translation_zh": "有/在", "translation_en": "there is/are", "example": "Ada pohon di depan."},
    "tidak":     {"pos": "adverb",  "translation_zh": "不",    "translation_en": "no/not",      "example": "Saya tidak tahu."},
    "ya":        {"pos": "particle","translation_zh": "是的",  "translation_en": "yes",         "example": "Ya, saya setuju."},
    "dan":       {"pos": "conj",    "translation_zh": "和",    "translation_en": "and",         "example": "Saya dan kamu."},
    "di":        {"pos": "prep",    "translation_zh": "在",    "translation_en": "at/in/on",    "example": "Dia di sekolah."},
    "ke":        {"pos": "prep",    "translation_zh": "去/到", "translation_en": "to",          "example": "Saya pergi ke pasar."},
    "dari":      {"pos": "prep",    "translation_zh": "从",    "translation_en": "from",        "example": "Dari Jakarta ke Bandung."},
    "yang":      {"pos": "conj",    "translation_zh": "的/所", "translation_en": "which/that",  "example": "Orang yang baik."},
    "saya":      {"pos": "pronoun", "translation_zh": "我",    "translation_en": "I/me",        "example": "Saya suka kopi."},
    "kamu":      {"pos": "pronoun", "translation_zh": "你",    "translation_en": "you",         "example": "Kamu cantik."},
    "dia":       {"pos": "pronoun", "translation_zh": "他/她", "translation_en": "he/she",      "example": "Dia guru saya."},
    "kita":      {"pos": "pronoun", "translation_zh": "我们(含)", "translation_en": "we (incl.)", "example": "Kita pergi bersama."},
    "mereka":    {"pos": "pronoun", "translation_zh": "他们",  "translation_en": "they",        "example": "Mereka tinggal di sini."},
    "makan":     {"pos": "verb",    "translation_zh": "吃",    "translation_en": "eat",         "example": "Saya makan nasi."},
    "minum":     {"pos": "verb",    "translation_zh": "喝",    "translation_en": "drink",       "example": "Dia minum air."},
    "pergi":     {"pos": "verb",    "translation_zh": "去",    "translation_en": "go",          "example": "Mereka pergi sekarang."},
    "lihat":     {"pos": "verb",    "translation_zh": "看",    "translation_en": "see/look",    "example": "Saya lihat gunung."},
    "beli":      {"pos": "verb",    "translation_zh": "买",    "translation_en": "buy",         "example": "Dia beli buah."},
    "rumah":     {"pos": "noun",    "translation_zh": "房子",  "translation_en": "house",       "example": "Rumah ini besar."},
    "jalan":     {"pos": "noun",    "translation_zh": "路",    "translation_en": "road/street", "example": "Jalan ini panjang."},
    "air":       {"pos": "noun",    "translation_zh": "水",    "translation_en": "water",       "example": "Air ini bersih."},
    "makanan":   {"pos": "noun",    "translation_zh": "食物",  "translation_en": "food",        "example": "Makanan ini enak."},
    "orang":     {"pos": "noun",    "translation_zh": "人",    "translation_en": "person",      "example": "Orang itu ramah."},
    "besar":     {"pos": "adj",     "translation_zh": "大的",  "translation_en": "big/large",   "example": "Gedung ini besar."},
    "kecil":     {"pos": "adj",     "translation_zh": "小的",  "translation_en": "small",       "example": "Anak itu kecil."},
    "bagus":     {"pos": "adj",     "translation_zh": "好的",  "translation_en": "good/nice",   "example": "Gambar ini bagus."},
    "baru":      {"pos": "adj",     "translation_zh": "新的",  "translation_en": "new",         "example": "Buku ini baru."},
    "lama":      {"pos": "adj",     "translation_zh": "旧的/久","translation_en": "old/long time","example": "Dia lama di sini."},
}


def _load_fallback() -> None:
    """Populate vocab_cache with hardcoded fallback words with proper translations."""
    global vocab_cache
    for word in FALLBACK_VOCABULARY:
        detail = _FALLBACK_DETAILS.get(word, {})
        vocab_cache[word] = VocabularyEntry(
            word=word,
            pos=detail.get("pos", "unknown"),
            cefr_level="A1",
            translation_zh=detail.get("translation_zh", word),
            translation_en=detail.get("translation_en", word),
            example_sentence=detail.get("example", f"Saya suka {word}."),
        )
    logger.info(f"Fallback vocabulary loaded: {len(FALLBACK_VOCABULARY)} words")


def get_vocab_entry(word: str) -> VocabularyEntry | None:
    """Look up a word in the cache. Returns None if not found."""
    return vocab_cache.get(word)


def is_known_word(word: str) -> bool:
    """Check if a word exists in the vocabulary cache."""
    return word in vocab_cache
