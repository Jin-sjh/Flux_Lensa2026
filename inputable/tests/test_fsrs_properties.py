"""Property-based tests for FSRS update logic using Hypothesis."""
import pytest
from hypothesis import given, settings, assume
from hypothesis import strategies as st

from models.db_models import UserWordStatus
from services.user_model import apply_fsrs_update


def make_record(interval: int, ease_factor: float) -> UserWordStatus:
    r = UserWordStatus()
    r.interval = interval
    r.ease_factor = ease_factor
    r.status = "learning"
    return r


@given(
    interval=st.integers(min_value=1, max_value=365),
    ease_factor=st.floats(min_value=1.3, max_value=3.0, allow_nan=False),
)
@settings(max_examples=200)
def test_correct_answer_never_decreases_interval(interval, ease_factor):
    """Property: correct answer always produces interval >= original interval."""
    # Feature: inputable-backend, Property 1: correct answer never decreases interval
    r = make_record(interval, ease_factor)
    apply_fsrs_update(r, is_correct=True)
    assert r.interval >= interval


@given(
    interval=st.integers(min_value=1, max_value=365),
    ease_factor=st.floats(min_value=1.3, max_value=3.0, allow_nan=False),
)
@settings(max_examples=200)
def test_incorrect_answer_always_resets_interval_to_1(interval, ease_factor):
    """Property: incorrect answer always resets interval to 1."""
    # Feature: inputable-backend, Property 2: incorrect answer resets interval to 1
    r = make_record(interval, ease_factor)
    apply_fsrs_update(r, is_correct=False)
    assert r.interval == 1


@given(
    interval=st.integers(min_value=1, max_value=365),
    ease_factor=st.floats(min_value=1.3, max_value=3.0, allow_nan=False),
    is_correct=st.booleans(),
)
@settings(max_examples=200)
def test_ease_factor_stays_in_bounds(interval, ease_factor, is_correct):
    """Property: ease_factor always stays within [1.3, 3.0] after any update."""
    # Feature: inputable-backend, Property 3: ease_factor bounded
    r = make_record(interval, ease_factor)
    apply_fsrs_update(r, is_correct=is_correct)
    assert 1.3 <= r.ease_factor <= 3.0


@given(
    interval=st.integers(min_value=1, max_value=365),
    ease_factor=st.floats(min_value=1.3, max_value=3.0, allow_nan=False),
    is_correct=st.booleans(),
)
@settings(max_examples=200)
def test_status_always_valid(interval, ease_factor, is_correct):
    """Property: status is always one of learning/learned/mastered after update."""
    # Feature: inputable-backend, Property 4: status always valid
    r = make_record(interval, ease_factor)
    apply_fsrs_update(r, is_correct=is_correct)
    assert r.status in {"learning", "learned", "mastered"}
