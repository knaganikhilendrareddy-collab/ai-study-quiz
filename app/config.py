from pathlib import Path
import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "study_quiz.db"
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

APP_NAME = os.getenv("APP_NAME", "AI Study Quiz")
AI_PROVIDER = os.getenv("AI_PROVIDER", "demo")
AI_API_KEY = os.getenv("AI_API_KEY", "")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
