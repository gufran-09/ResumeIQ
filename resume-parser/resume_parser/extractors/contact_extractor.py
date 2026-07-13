"""Extract contact information: name, email, phone from resume text."""

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
)

PHONE_PATTERNS = [
    re.compile(r"(\+?91[-.\s]?)?(\d{10})"),
    re.compile(r"(\+?91[-.\s]?)?(\d{5}[-.\s]\d{5})"),
    re.compile(r"\(\d{3}\)\s*\d{3}[-.\s]\d{4}"),
    re.compile(r"\+\d{1,3}[-.\s]\d{1,4}[-.\s]\d{3,4}[-.\s]\d{3,4}"),
]


def extract_email(text: str) -> Optional[str]:
    match = EMAIL_PATTERN.search(text)
    if match:
        return match.group(0).lower()
    return None


def extract_phone(text: str) -> Optional[str]:
    for pattern in PHONE_PATTERNS:
        match = pattern.search(text)
        if match:
            phone = match.group(0).strip()
            digits = re.sub(r"[^\d+]", "", phone)
            if len(digits) >= 10:
                return phone
    return None


def extract_name(text: str, nlp=None) -> Optional[str]:
    """Extract the candidate name using spaCy NER or heuristics.

    Tries spaCy PERSON entities first, then falls back to the first
    non-empty line that looks like a name.
    """
    if nlp is not None:
        try:
            doc = nlp(text[:2000])
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
                    name = ent.text.strip()
                    if _is_likely_name(name):
                        return _format_name(name)
        except Exception as exc:
            logger.warning("spaCy NER failed: %s", exc)

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:10]:
        if _is_likely_name(line):
            return _format_name(line)

    return None


def _is_likely_name(text: str) -> bool:
    words = text.split()
    if len(words) < 2 or len(words) > 5:
        return False
    if any(word.lower() in {"resume", "cv", "curriculum", "vitae", "email", "phone"} for word in words):
        return False
    if "@" in text or any(c.isdigit() for c in text):
        return False
    if any(c in text for c in "|/\\@#$%^*<>"):
        return False
    return all(word[0].isupper() or not word.isalpha() for word in words)


def _format_name(name: str) -> str:
    name = re.sub(r"[^a-zA-Z\s.-]", "", name).strip()
    parts = name.split()
    return " ".join(parts[:4]) if parts else name
