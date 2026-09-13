from pathlib import Path

from fastapi import UploadFile
from PIL import Image

from ..config import MAX_UPLOAD_MB, TESSERACT_CMD, UPLOAD_DIR


def validate_upload(file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".pdf"}:
        raise ValueError("Please upload a JPG, PNG, or PDF file.")
    return suffix


def extract_text(file_path: Path, suffix: str) -> str:
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
            pages = PdfReader(str(file_path)).pages
            return "\n".join(page.extract_text() or "" for page in pages)
        except Exception as error:
            raise ValueError(f"Could not read this PDF: {error}") from error
    try:
        import pytesseract
        if TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
        return pytesseract.image_to_string(Image.open(file_path))
    except Exception as error:
        raise ValueError("OCR is unavailable or the image could not be read. Demo analysis is still available.") from error


async def save_and_extract(file: UploadFile) -> tuple[str, str]:
    suffix = validate_upload(file)
    content = await file.read()
    if not content:
        raise ValueError("The uploaded file is empty.")
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise ValueError(f"Files must be smaller than {MAX_UPLOAD_MB} MB.")
    safe_name = f"{abs(hash(file.filename))}_{Path(file.filename or 'material').name}"
    destination = UPLOAD_DIR / safe_name
    destination.write_bytes(content)
    return str(destination), extract_text(destination, suffix)
