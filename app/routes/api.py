import json
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..database import get_db
from ..models import AttemptRequest, ChatRequest, QuizRequest
from ..services.ai_service import analyze_content, analyze_performance, chat_response, generate_questions
from ..services.document_service import save_and_extract

router = APIRouter(prefix="/api")


@router.post("/chat")
def chat(request: ChatRequest):
    return {"reply": chat_response(request.message, request.history), "mode": "demo"}


def row_dict(row):
    return dict(row) if row else None


@router.get("/dashboard")
def dashboard():
    with get_db() as db:
        attempts = [row_dict(row) for row in db.execute("SELECT * FROM attempts WHERE user_id = 1 ORDER BY id DESC").fetchall()]
        materials = [row_dict(row) for row in db.execute("SELECT * FROM materials WHERE user_id = 1 ORDER BY id DESC LIMIT 6").fetchall()]
    scores = [item["score"] for item in attempts]
    return {"user": {"name": "Alex Morgan", "initials": "AM"}, "attempts": attempts, "materials": materials, "stats": {"quizzes_completed": len(scores), "average_score": round(sum(scores) / len(scores)) if scores else 0, "best_score": max(scores) if scores else 0, "streak": min(len(scores), 7)}}


@router.post("/materials/upload")
async def upload_material(file: UploadFile = File(...)):
    try:
        file_path, extracted_text = await save_and_extract(file)
        content = analyze_content(extracted_text)
        with get_db() as db:
            cursor = db.execute("INSERT INTO materials (user_id, filename, file_type, topic, summary, keywords, extracted_text) VALUES (1, ?, ?, ?, ?, ?, ?)", (file.filename, Path(file_path).suffix, content["topic"], content["summary"], json.dumps(content["keywords"]), extracted_text))
            material_id = cursor.lastrowid
        return {"id": material_id, "filename": file.filename, "extracted_text": extracted_text, **content}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="We could not process that material. Please try another file.") from error


@router.post("/quiz/generate")
def create_quiz(request: QuizRequest):
    with get_db() as db:
        material = db.execute("SELECT * FROM materials WHERE id = ?", (request.material_id,)).fetchone() if request.material_id else None
    content = {"topic": material["topic"] if material else "The Psychology of Deep Work"}
    return {"topic": content["topic"], "questions": generate_questions(content, request.question_count, request.difficulty)}


@router.post("/attempts")
def save_attempt(request: AttemptRequest):
    correct = sum(1 for question in request.questions if request.answers.get(str(question["id"])) == question["correct_answer"])
    unanswered = sum(1 for question in request.questions if request.answers.get(str(question["id"])) is None)
    score = round(correct / len(request.questions) * 100) if request.questions else 0
    analysis = analyze_performance(request.questions, request.answers)
    with get_db() as db:
        cursor = db.execute("INSERT INTO attempts (user_id, material_id, topic, total_questions, correct_answers, unanswered, score, time_taken, answers_json, questions_json) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (request.material_id, request.topic, len(request.questions), correct, unanswered, score, request.time_taken, json.dumps(request.answers), json.dumps(request.questions)))
    return {"id": cursor.lastrowid, "correct": correct, "unanswered": unanswered, "wrong": len(request.questions) - correct - unanswered, "score": score, "time_taken": request.time_taken, "performance": "Excellent" if score >= 80 else "On track" if score >= 60 else "Keep practicing", "analysis": analysis}


@router.get("/attempts/{attempt_id}")
def get_attempt(attempt_id: int):
    with get_db() as db:
        attempt = db.execute("SELECT * FROM attempts WHERE id = ?", (attempt_id,)).fetchone()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    payload = row_dict(attempt)
    payload["questions"] = json.loads(payload.pop("questions_json"))
    payload["answers"] = json.loads(payload.pop("answers_json"))
    return payload
