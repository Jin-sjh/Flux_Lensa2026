from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone
import uuid


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)
    target_lang = Column(String, default="id")
    estimated_cefr = Column(String, default="A1")
    has_completed_test = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)


class UserWordStatus(Base):
    __tablename__ = "user_word_status"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    word = Column(String, nullable=False)
    status = Column(String, default="learning")  # learning/learned/mastered
    last_seen_at = Column(DateTime, default=_utcnow)
    next_review_at = Column(DateTime, nullable=True)
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)


class LearningSession(Base):
    __tablename__ = "learning_sessions"
    session_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    rendered_image_path = Column(String, nullable=True)
    focus_construction = Column(String, nullable=True)
    generated_content = Column(JSON, nullable=True)
    new_vocab = Column(JSON, nullable=True)
    output_task = Column(JSON, nullable=True)
    user_output = Column(Text, nullable=True)
    feedback = Column(JSON, nullable=True)

    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AnkiExport(Base):
    __tablename__ = "anki_exports"
    export_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    session_ids = Column(JSON, nullable=True)
    apkg_path = Column(String, nullable=False)
    exported_at = Column(DateTime, default=_utcnow)
