"""FastAPI routes for resume parsing."""

import logging

from fastapi import APIRouter, File, UploadFile, HTTPException, status

from ..models import ParseResponse
from ..services.resume_parser_service import ResumeParserService
from ..exceptions import ResumeParserError

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _get_service() -> ResumeParserService:
    from main import app_state
    return app_state.parser_service


def _validate_file(file: UploadFile) -> str:
    filename = file.filename or ""
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {ext or 'unknown'}. Allowed: PDF, DOCX",
        )

    return filename


@router.post(
    "/parse",
    response_model=ParseResponse,
    summary="Parse a resume file",
    description="Upload a PDF or DOCX resume file to extract structured candidate information including name, email, phone, education, experience, skills, projects, and certifications.",
    response_description="Structured parsed resume data",
)
async def parse_resume(file: UploadFile = File(...)):
    """Parse a resume file (PDF or DOCX) and return structured candidate data."""
    filename = _validate_file(file)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed: {MAX_FILE_SIZE // (1024 * 1024)} MB",
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded.",
        )

    service = _get_service()
    try:
        return service.parse(filename, content)
    except ResumeParserError as e:
        logger.warning("Parser error for %s: %s", filename, e.message)
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.exception("Unexpected error parsing %s", filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while parsing the resume: {str(e)}",
        )


@router.get(
    "/skills",
    summary="List supported skills",
    description="Returns the full skill database used for fuzzy matching during resume parsing.",
)
async def get_skills():
    """Return the skill database."""
    service = _get_service()
    return service.get_skill_database()
