from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    cefrLevel: str | None = None
    hasCompletedTest: bool = False
    createdAt: str


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


class UpdateLevelRequest(BaseModel):
    userId: str
    cefrLevel: Literal["A1", "A2", "B1"]


class VocabularyEntry(BaseModel):
    word: str
    pos: str
    cefr_level: str
    translation_zh: str
    translation_en: str
    example_sentence: str


class NewWord(BaseModel):
    word: str
    translation_zh: str
    translation_en: str


class Annotation(BaseModel):
    object: str
    label: str
    new_words: list[NewWord] = []


class OutputTask(BaseModel):
    type: Literal["fill_blank"]
    prompt: str
    answer: str


class GenerateRequest(BaseModel):
    user_id: str
    image: str  # base64-encoded JPEG/PNG
    mode: Literal["annotation"] = "annotation"


class GenerateResponse(BaseModel):
    session_id: str
    annotations: list[Annotation]
    caption: str
    output_task: OutputTask
    rendered_image_url: str | None = None


class RenderResponse(BaseModel):
    rendered_image_url: str | None
    annotations: list[Annotation] | None = None


class EvaluateRequest(BaseModel):
    session_id: str
    user_output: str


class EvaluateResponse(BaseModel):
    is_correct: bool
    feedback: str
    words_updated: list[str]
    cefr_upgraded: str | None = None


class PlacementTestRequest(BaseModel):
    user_id: str
    known_words: list[str] = []  # empty = skip test, defaults to A1


class PlacementTestResponse(BaseModel):
    estimated_cefr: str
    learned_words_seeded: int


class SessionListItem(BaseModel):
    session_id: str
    user_id: str
    image_path: str | None = None
    rendered_image_path: str | None = None
    thumbnail_path: str | None = None
    caption: str | None = None
    new_vocab: list[str] = []
    output_task: dict | None = None
    user_output: str | None = None
    feedback: dict | None = None
    completed: bool = False
    created_at: str


class SessionListResponse(BaseModel):
    sessions: list[SessionListItem]
    total: int


class SessionDetail(BaseModel):
    session_id: str
    user_id: str
    image_path: str | None = None
    rendered_image_path: str | None = None
    generated_content: dict | None = None
    caption: str | None = None
    annotations: list[Annotation] = []
    new_vocab: list[str] = []
    output_task: OutputTask | None = None
    user_output: str | None = None
    feedback: dict | None = None
    completed: bool = False
    created_at: str


class VocabularyItem(BaseModel):
    word: str
    status: str
    translation_zh: str | None = None
    translation_en: str | None = None
    last_seen_at: str | None = None
    next_review_at: str | None = None
    interval: int = 1
    ease_factor: float = 2.5


class VocabularyListResponse(BaseModel):
    vocabulary: list[VocabularyItem]
    total: int


class CompleteSessionResponse(BaseModel):
    session_id: str
    completed: bool
    message: str


class UpdateSessionRequest(BaseModel):
    caption: str | None = None
    completed: bool | None = None
    annotations: list[Annotation] | None = None


class DeleteSessionResponse(BaseModel):
    session_id: str
    deleted: bool
    message: str
