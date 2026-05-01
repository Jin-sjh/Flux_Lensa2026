import pytest
from models.db_models import UserWordStatus
from services.user_model import apply_fsrs_update


def make_record(interval: int, ease_factor: float, status: str = "learning") -> UserWordStatus:
    r = UserWordStatus()
    r.interval = interval
    r.ease_factor = ease_factor
    r.status = status
    return r


# ── Status threshold boundary tests ──────────────────────────────────────────

def test_interval_6_correct_stays_learning():
    r = make_record(interval=3, ease_factor=2.0)  # 3 * 2.0 = 6
    apply_fsrs_update(r, is_correct=True)
    assert r.interval == 6
    assert r.status == "learning"


def test_interval_7_correct_becomes_learned():
    r = make_record(interval=3, ease_factor=2.5)  # int(3 * 2.5) = 7
    apply_fsrs_update(r, is_correct=True)
    assert r.interval == 7
    assert r.status == "learned"


def test_interval_21_correct_becomes_mastered():
    r = make_record(interval=8, ease_factor=2.7)  # int(8 * 2.7) = 21
    apply_fsrs_update(r, is_correct=True)
    assert r.interval == 21
    assert r.status == "mastered"


def test_incorrect_resets_interval_to_1():
    r = make_record(interval=15, ease_factor=2.8, status="learned")
    apply_fsrs_update(r, is_correct=False)
    assert r.interval == 1
    assert r.status == "learning"


# ── ease_factor boundary tests ────────────────────────────────────────────────

def test_ease_factor_floor_at_1_3():
    r = make_record(interval=1, ease_factor=1.3)
    apply_fsrs_update(r, is_correct=False)
    assert r.ease_factor == pytest.approx(1.3)


def test_ease_factor_cap_at_3_0():
    r = make_record(interval=1, ease_factor=3.0)
    apply_fsrs_update(r, is_correct=True)
    assert r.ease_factor == pytest.approx(3.0)


def test_ease_factor_increases_on_correct():
    r = make_record(interval=1, ease_factor=2.5)
    apply_fsrs_update(r, is_correct=True)
    assert r.ease_factor == pytest.approx(2.6)


def test_ease_factor_decreases_on_incorrect():
    r = make_record(interval=5, ease_factor=2.5)
    apply_fsrs_update(r, is_correct=False)
    assert r.ease_factor == pytest.approx(2.3)
