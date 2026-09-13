from typing import Any

from pydantic import BaseModel, Field


class Question(BaseModel):
    id: int
    question: str
    options: list[str]
    correct_answer: int
    explanation: str
    difficulty: str
    topic: str


class QuizRequest(BaseModel):
    material_id: int | None = None
    question_count: int = Field(default=5, ge=5, le=30)
    difficulty: str = "Mixed"


class AttemptRequest(BaseModel):
    material_id: int | None = None
    topic: str = "General Study"
    questions: list[dict[str, Any]]
    answers: dict[str, int | None]
    time_taken: int = 0


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[dict[str, str]] = []
