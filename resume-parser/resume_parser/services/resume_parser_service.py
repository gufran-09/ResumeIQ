"""Service layer that orchestrates the full resume parsing pipeline."""

import logging
from typing import Optional

from ..models import ParsedResume, ParseResponse
from .parsers.file_parser import extract_text
from .extractors.contact_extractor import extract_email, extract_phone, extract_name
from .extractors.education_extractor import extract_education
from .extractors.experience_extractor import extract_experience
from .extractors.project_extractor import extract_projects
from .extractors.certification_extractor import extract_certifications
from .extractors.skill_database import extract_skills_from_text
from ..normalizer import normalize_parsed_resume
from ..exceptions import ParsingError, EmptyContentError

logger = logging.getLogger(__name__)


class ResumeParserService:
    """Orchestrates the full parsing pipeline: file → text → extractors → normalizer → ParsedResume."""

    def __init__(self, nlp_model=None):
        self.nlp_model = nlp_model

    def parse(self, filename: str, content: bytes) -> ParseResponse:
        """Parse a resume file and return a structured ParseResponse."""
        logger.info("Starting parse for file: %s (%d bytes)", filename, len(content))

        text = extract_text(filename, content)

        if not text or len(text.strip()) < 50:
            raise EmptyContentError("No readable text could be extracted from the file.")

        logger.info("Extracted %d characters of text", len(text))

        parsed = self._extract_all(text)
        parsed = normalize_parsed_resume(parsed)

        logger.info(
            "Parse complete: name=%s, skills=%d, education=%d, experience=%d, projects=%d, certs=%d",
            parsed.name,
            len(parsed.skills),
            len(parsed.education),
            len(parsed.experience),
            len(parsed.projects),
            len(parsed.certifications),
        )

        return ParseResponse(
            success=True,
            filename=filename,
            data=parsed,
        )

    def _extract_all(self, text: str) -> ParsedResume:
        """Run all extractors on the raw text."""
        email = extract_email(text)
        phone = extract_phone(text)
        name = extract_name(text, self.nlp_model)

        education = extract_education(text)
        experience = extract_experience(text)
        projects = extract_projects(text)
        certifications = extract_certifications(text)
        skills = extract_skills_from_text(text)

        total_months = sum((exp.duration_months or 0) for exp in experience)

        return ParsedResume(
            name=name,
            email=email,
            phone=phone,
            skills=skills,
            education=education,
            experience=experience,
            projects=projects,
            certifications=certifications,
            total_experience_months=total_months if total_months > 0 else None,
        )

    def get_skill_database(self) -> dict:
        """Return the skill database for the /skills endpoint."""
        from .extractors.skill_database import get_skill_database
        return get_skill_database()
