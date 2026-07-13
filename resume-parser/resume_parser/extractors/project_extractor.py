"""Extract project information from resume text."""

import logging
import re
from typing import Optional

from ..models import ProjectInfo
from .skill_database import extract_skills_from_text

logger = logging.getLogger(__name__)


def extract_projects(text: str) -> list[ProjectInfo]:
    """Extract project entries from resume text."""
    results: list[ProjectInfo] = []

    project_section = _extract_section(text, ["project", "projects", "personal project", "academic project"])

    if not project_section:
        return results

    lines = [line.strip() for line in project_section.split("\n") if line.strip()]

    current_title: Optional[str] = None
    current_desc_lines: list[str] = []

    for line in lines:
        is_title = _is_project_title(line)
        if is_title:
            if current_title:
                results.append(_build_project(current_title, current_desc_lines))
            current_title = line
            current_desc_lines = []
        elif current_title and len(line) > 10:
            current_desc_lines.append(line)

    if current_title:
        results.append(_build_project(current_title, current_desc_lines))

    return results[:6]


def _is_project_title(line: str) -> bool:
    title_indicators = ["project", "Project", "PROJECT", "Title:", "Title :"]
    if any(ind in line for ind in title_indicators):
        return True
    if len(line) < 5 or len(line) > 100:
        return False
    if line.startswith(("•", "-", "*", "▸", "▪")):
        return True
    title_case = sum(1 for w in line.split() if w[0].isupper()) >= 2
    return title_case and ":" in line


def _build_project(title: str, desc_lines: list[str]) -> ProjectInfo:
    clean_title = re.sub(r"^(Project\s*\d*[:\-]?\s*|Title[:\-]?\s*|•\s*|-\s*|\*\s*)", "", title, flags=re.IGNORECASE).strip()
    description = " ".join(desc_lines[:3]) if desc_lines else None
    technologies = extract_skills_from_text(" ".join(desc_lines)) if desc_lines else []

    return ProjectInfo(
        title=clean_title or title,
        description=description,
        technologies=technologies,
    )


def _extract_section(text: str, keywords: list[str]) -> Optional[str]:
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if any(kw.lower() in line.lower() for kw in keywords):
            section_lines = []
            for j in range(i + 1, min(i + 25, len(lines))):
                next_line = lines[j].strip()
                if not next_line:
                    continue
                lower = next_line.lower()
                if any(kw in lower for kw in ["experience", "education", "skill", "certification", "contact", "summary", "objective"]):
                    break
                section_lines.append(next_line)
            if section_lines:
                return "\n".join(section_lines)
    return None
