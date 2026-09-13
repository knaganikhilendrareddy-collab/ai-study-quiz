from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import APP_NAME
from .database import init_db
from .routes.api import router

BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title=APP_NAME)
app.include_router(router)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


@app.on_event("startup")
def startup():
    init_db()


@app.get("/", include_in_schema=False)
def home():
    return FileResponse(BASE_DIR / "templates" / "index.html")
