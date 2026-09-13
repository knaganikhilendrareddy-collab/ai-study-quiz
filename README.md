# AI Study Quiz

A production-style study companion built with FastAPI, SQLite, vanilla JavaScript, and a provider-neutral AI service layer. Upload a JPG, PNG, or PDF, extract study content, generate MCQs, complete a timed quiz, and review personalized performance insights.

## Features

- Responsive dashboard with quiz history, averages, best score, and streak
- JPG/PNG/PDF upload validation with configurable size limits
- OCR via Tesseract and PDF text extraction via pypdf
- Demo analysis and question generation without an API key
- One-question-at-a-time MCQ flow with timer, instant feedback, and review marking
- SQLite persistence for users, materials, and quiz attempts
- Performance analysis with strong topics, revision topics, and next difficulty
- Provider-neutral AI service boundary ready for an API integration

## VS Code setup

1. Open this folder in VS Code.
2. Create and activate a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env`. The default `AI_PROVIDER=demo` requires no credentials.
5. For image OCR, install the Tesseract executable separately and set `TESSERACT_CMD` in `.env` if it is not on PATH. PDFs with embedded text work without Tesseract.
6. Start the development server:

   ```powershell
   uvicorn app.main:app --reload
   ```

7. Open http://127.0.0.1:8000.

## Project structure

- `app/main.py` - FastAPI app and static page hosting
- `app/routes/api.py` - dashboard, upload, quiz, and attempt APIs
- `app/database.py` - SQLite schema and connection helper
- `app/services/document_service.py` - upload validation, OCR, and PDF extraction
- `app/services/ai_service.py` - demo content, question generation, and analysis boundary
- `app/templates/index.html` - application shell
- `app/static/app.js` - frontend state and API interactions
- `app/static/styles.css` - responsive product UI
- `data/` - generated SQLite database and uploads (ignored from source control)

## Connecting a real AI provider

Keep API credentials in `.env` and implement the provider call inside `app/services/ai_service.py`. The browser only communicates with the backend, so keys are never exposed to frontend code. Preserve the existing demo fallback for local development and provider outages.

## Validation

```powershell
python -m compileall app
```

The app creates `data/study_quiz.db` automatically on first startup.

## Publish publicly with Google Cloud Run

Install the Google Cloud CLI, sign in, create or select a billing-enabled Google Cloud project, and run these commands from the project folder:

```powershell
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud run deploy ai-study-quiz --source . --region us-central1 --allow-unauthenticated
```

Cloud Run builds the included `Dockerfile` and prints a public HTTPS URL. The current SQLite database uses container storage, so quiz history and uploaded files are not durable across container replacement. For a permanent public deployment, move persistence to Cloud SQL or Firestore and uploads to Cloud Storage.

## Free deployment with Render

The included `render.yaml` supports a free Render web service. Push the project to GitHub, open [render.com](https://render.com), choose **New +** then **Blueprint**, connect the repository, and select `render.yaml`. Render will build the Docker image and provide a public URL without Google Cloud billing.

The free service may sleep when unused. SQLite and uploaded files are also temporary on free container hosting.
