"""Property-based tests for i+1 constraint enforcement."""
from hypothesis import given, settings
from hypothesis import strategies as st

from services.sonnet_service import enforce_i1_cap, CEFR_CAPS


@given(
    cefr=st.sampled_from(["A1", "A2", "B1"]),
    new_words=st.lists(
        st.fixed_dictionaries({
            "word": st.text(min_size=1, max_size=20),
            "translation_zh": st.text(min_size=1, max_size=20),
            "translation_en": st.text(min_size=1, max_size=20),
        }),
        min_size=0,
        max_size=20,
    ),
)
@settings(max_examples=300)
def test_i1_cap_never_exceeded(cefr, new_words):
    """Property: enforce_i1_cap output length is always <= CEFR cap.
    Feature: inputable-backend, Property 5: i+1 cap never exceeded
    """
    result = enforce_i1_cap(new_words, cefr)
    assert len(result) <= CEFR_CAPS[cefr]


@given(
    cefr=st.sampled_from(["A1", "A2", "B1"]),
    new_words=st.lists(
        st.fixed_dictionaries({
            "word": st.text(min_size=1, max_size=20),
            "translation_zh": st.text(min_size=1, max_size=20),
            "translation_en": st.text(min_size=1, max_size=20),
        }),
        min_size=0,
        max_size=5,
    ),
)
@settings(max_examples=200)
def test_i1_cap_preserves_order(cefr, new_words):
    """Property: enforce_i1_cap returns a prefix of the original list (order preserved)."""
    result = enforce_i1_cap(new_words, cefr)
    assert result == new_words[: len(result)]
