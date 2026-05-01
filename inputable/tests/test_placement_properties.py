"""Property-based tests for placement test logic."""
from hypothesis import given, settings
from hypothesis import strategies as st

from services.user_model import compute_cefr, PLACEMENT_WORDS

all_placement_words = (
    PLACEMENT_WORDS["A1"] + PLACEMENT_WORDS["A2"] + PLACEMENT_WORDS["B1"]
)


def test_empty_known_words_returns_a1():
    """Empty known_words always returns A1 (skip-test path)."""
    assert compute_cefr([]) == "A1"


@given(known_words=st.lists(st.text(min_size=1, max_size=20), min_size=0, max_size=30))
@settings(max_examples=300)
def test_compute_cefr_always_returns_valid_level(known_words):
    """Property: compute_cefr always returns one of A1/A2/B1."""
    result = compute_cefr(known_words)
    assert result in {"A1", "A2", "B1"}


def test_all_words_known_returns_b1():
    """Knowing all placement words returns B1."""
    assert compute_cefr(all_placement_words) == "B1"


def test_only_a1_words_returns_a1():
    """Knowing only A1 words (not enough A2) returns A1."""
    result = compute_cefr(PLACEMENT_WORDS["A1"])
    assert result == "A1"


def test_a1_and_a2_words_returns_a2():
    """Knowing all A1 + all A2 words (no B1) returns A2."""
    result = compute_cefr(PLACEMENT_WORDS["A1"] + PLACEMENT_WORDS["A2"])
    assert result == "A2"
