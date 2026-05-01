from __future__ import annotations
from typing import Literal
from pydantic import BaseModel


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


class UserResponse(BaseModel):
    user_id: str
    estimated_cefr: str
    learned_word_count: int


class CreateUserRequest(BaseModel):
    user_id: str | None = None
    cefr: str = "A1"


class PlacementTestRequest(BaseModel):
    user_id: str
    known_words: list[str] = []  # empty = skip test, defaults to A1


class PlacementTestResponse(BaseModel):
    estimated_cefr: str
    learned_words_seeded: int
