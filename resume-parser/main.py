"""
ResumeIQ — Resume Parsing Service
FastAPI service that extracts candidate information from PDF and DOCX resumes.
"""

import logging
from contextlib import asynccontextmanager
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from resume_parser.routes import router
from resume_parser.exceptions import register_exception_handlers
from resume_parser.services.resume_parser_service import ResumeParserService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app_state = SimpleNamespace(parser_service=None, spacy_model=None)


def _load_spacy_model():
    """Load spaCy NER model for name extraction (optional, falls back to heuristics)."""
    try:
        import spacy
        model = spacy.load("en_core_web_sm")
        logger.info("spaCy model 'en_core_web_sm' loaded successfully.")
        return model
    except ImportError:
        logger.warning("spaCy not installed. Name extraction will use heuristic fallback.")
    except Exception:
        logger.warning("spaCy model 'en_core_web_sm' not available. Name extraction will use heuristic fallback.")
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ResumeIQ Resume Parser starting up...")
    app_state.spacy_model = _load_spacy_model()
    app_state.parser_service = ResumeParserService(nlp_model=app_state.spacy_model)
    yield
    logger.info("ResumeIQ Resume Parser shutting down.")


app = FastAPI(
    title="ResumeIQ Resume Parser",
    description="Extracts candidate information from PDF and DOCX resumes using NLP and fuzzy matching.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["Resume Parser"])
register_exception_handlers(app)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "resume-parser",
        "spacy_loaded": app_state.spacy_model is not None,
    }
