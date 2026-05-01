"""Property-based tests for VocabularyEntry round-trip serialization."""
import json
from hypothesis import given, settings
from hypothesis import strategies as st

from models.schemas import VocabularyEntry

vocab_entry_strategy = st.fixed_dictionaries({
    "word": st.text(min_size=1, max_size=30, alphabet=st.characters(whitelist_categories=("Ll", "Lu"))),
    "pos": st.sampled_from(["noun", "verb", "adj", "adv", "other"]),
    "cefr_level": st.sampled_from(["A1", "A2", "B1", "B2", "C1"]),
    "translation_zh": st.text(min_size=1, max_size=20),
    "translation_en": st.text(min_size=1, max_size=30),
    "example_sentence": st.text(min_size=1, max_size=100),
})


@given(data=vocab_entry_strategy)
@settings(max_examples=200)
def test_vocab_entry_roundtrip(data):
    """Property: VocabularyEntry serializes and deserializes to identical values.
    Feature: inputable-backend, Property 6: vocabulary round-trip
    """
    entry = VocabularyEntry(**data)
    serialized = entry.model_dump_json()
    restored = VocabularyEntry(**json.loads(serialized))

    assert restored.word == entry.word
    assert restored.pos == entry.pos
    assert restored.cefr_level == entry.cefr_level
    assert restored.translation_zh == entry.translation_zh
    assert restored.translation_en == entry.translation_en
    assert restored.example_sentence == entry.example_sentence
