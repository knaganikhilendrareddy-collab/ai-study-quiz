from typing import Any

from ..config import AI_API_KEY, AI_PROVIDER

DEMO_CONTENT = {
    "topic": "The Psychology of Deep Work",
    "summary": "Deep work is the ability to focus without distraction on cognitively demanding tasks. It creates value, improves skill, and becomes rarer as modern work fills with shallow interruptions.",
    "keywords": ["deep work", "attention", "shallow work", "deliberate practice", "distraction"],
    "chapter": "Focus, attention, and high-quality learning",
}

DEMO_QUESTIONS = [
    {"question": "What best describes deep work?", "options": ["Working quickly on many tasks", "Focused work without distraction", "Checking messages frequently", "Memorizing every detail"], "correct_answer": 1, "explanation": "Deep work means sustained concentration on a cognitively demanding task without distraction.", "difficulty": "Easy", "topic": "Core definition"},
    {"question": "Why is deep work considered valuable?", "options": ["It eliminates the need for rest", "It creates value and improves skill", "It guarantees instant results", "It makes every task creative"], "correct_answer": 1, "explanation": "Focused practice helps people produce valuable outcomes and develop expertise faster.", "difficulty": "Easy", "topic": "Value"},
    {"question": "What is shallow work?", "options": ["A long research session", "A difficult learning exercise", "Logistical work that is easy to replicate", "Reading a challenging book"], "correct_answer": 2, "explanation": "Shallow work is often logistical or administrative and can be performed with limited concentration.", "difficulty": "Medium", "topic": "Shallow work"},
    {"question": "Which habit most directly protects attention?", "options": ["Constant notifications", "Scheduled focus blocks", "Multitasking between tabs", "Starting without a goal"], "correct_answer": 1, "explanation": "Scheduling protected blocks makes concentration intentional and gives distractions a clear boundary.", "difficulty": "Medium", "topic": "Attention"},
    {"question": "Deep work becomes rarer mainly because modern work often encourages...", "options": ["Long walks", "Frequent context switching", "Handwritten notes", "Quiet spaces"], "correct_answer": 1, "explanation": "Messages, meetings, and open channels encourage frequent context switching that fragments attention.", "difficulty": "Medium", "topic": "Distraction"},
    {"question": "Deliberate practice is most effective when it is...", "options": ["Comfortable and automatic", "Focused on a specific skill", "Done while multitasking", "Avoiding useful feedback"], "correct_answer": 1, "explanation": "Deliberate practice targets a specific skill, stretches ability, and uses feedback to improve.", "difficulty": "Hard", "topic": "Deliberate practice"},
    {"question": "A useful way to reduce shallow work is to...", "options": ["Make every task urgent", "Define a clear shutdown ritual", "Keep all apps open", "Avoid planning"], "correct_answer": 1, "explanation": "A shutdown ritual closes open loops and protects future attention from unfinished work.", "difficulty": "Hard", "topic": "Planning"},
    {"question": "Attention residue refers to...", "options": ["Remembering a favorite song", "Part of your attention remaining on a previous task", "A type of sleep cycle", "A method of speed reading"], "correct_answer": 1, "explanation": "Attention residue is the lingering mental pull of a previous task after switching away from it.", "difficulty": "Hard", "topic": "Attention"},
]


def analyze_content(text: str) -> dict[str, Any]:
    if AI_PROVIDER != "demo" and AI_API_KEY:
        # Provider integration can be added here without exposing credentials to the browser.
        pass
    if not text.strip():
        return {**DEMO_CONTENT, "summary": "No readable text was found. This demo analysis shows how your study guide will be summarized."}
    return DEMO_CONTENT


def generate_questions(content: dict[str, Any], count: int, difficulty: str) -> list[dict[str, Any]]:
    questions = DEMO_QUESTIONS.copy()
    if difficulty.lower() != "mixed":
        filtered = [item for item in questions if item["difficulty"].lower() == difficulty.lower()]
        questions = filtered or questions
    result = []
    for index in range(count):
        item = questions[index % len(questions)].copy()
        item["id"] = index + 1
        result.append(item)
    return result


def analyze_performance(questions: list[dict[str, Any]], answers: dict[str, Any]) -> dict[str, Any]:
    topic_stats: dict[str, dict[str, int]] = {}
    for question in questions:
        topic = question.get("topic", "General Study")
        stats = topic_stats.setdefault(topic, {"correct": 0, "total": 0})
        stats["total"] += 1
        if answers.get(str(question.get("id"))) == question.get("correct_answer"):
            stats["correct"] += 1
    strong = [topic for topic, stats in topic_stats.items() if stats["correct"] / stats["total"] >= 0.7]
    weak = [topic for topic, stats in topic_stats.items() if stats["correct"] / stats["total"] < 0.7]
    return {"strong_topics": strong, "weak_topics": weak, "revision_topics": weak[:3], "recommendation": "Review the missed concepts, then retake a mixed quiz with one difficulty level higher." if weak else "Keep your momentum with a harder mixed quiz to deepen recall.", "next_difficulty": "Hard" if not weak else "Medium", "topic_stats": topic_stats}


def chat_response(message: str, history: list[dict[str, str]] | None = None) -> str:
    text = message.strip().lower()
    if text in {"hi", "hello", "hey", "hii", "good morning", "good evening"}:
        return "Hi! I am ready to help. Ask me to explain a topic, build a quiz, or give you a focused study plan."
    if "study tip" in text or "quick tip" in text:
        return "Try a 25-minute focus block: choose one small outcome, silence notifications, and write a one-sentence recall note when the timer ends."
    if "summar" in text or "summary" in text:
        return "A useful study summary has three parts: the main idea, the key terms, and one example. Share a topic or upload notes and I can shape it for you."
    if "explain" in text or "what is" in text or "how does" in text:
        return "I can explain that clearly. Send the exact concept and I will break it into a simple definition, an example, and a quick check question."
    if "quiz" in text or "question" in text:
        return "Absolutely. I can turn your study material into MCQs with explanations. Upload a guide or start the demo quiz from the dashboard."
    if "deep work" in text or "focus" in text:
        return "Deep work is focused, distraction-free attention on a demanding task. A good first step is a 25-minute focus block with notifications turned off."
    if "help" in text:
        return "I can explain concepts, create quiz questions, summarize a topic, or recommend what to revise next."
    if "thank" in text or "thanks" in text:
        return "You are welcome. Keep the next step small and specific, and I will help you keep moving."
    return "I understand. Tell me the topic, paste a concept, or ask me to make a quick quiz and I will help you study it."
