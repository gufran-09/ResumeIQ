"""Extract education information: degree, institution, CGPA, graduation year."""

import logging
import re
from typing import Optional

from ..models import EducationInfo
from .skill_database import SKILL_DATABASE

logger = logging.getLogger(__name__)

DEGREES = [
    "B.Tech", "M.Tech", "B.E.", "M.E.", "B.Sc", "M.Sc", "BCA", "MCA",
    "B.Com", "M.Com", "MBA", "PhD", "B.Arch", "M.Arch",
    "Bachelor of Technology", "Master of Technology",
    "Bachelor of Engineering", "Master of Engineering",
    "Bachelor of Science", "Master of Science",
    "Bachelor of Computer Applications", "Master of Computer Applications",
    "Bachelor", "Master", "Diploma",
]

DEPARTMENTS = [
    "Computer Science", "Information Technology", "Electronics",
    "Mechanical", "Civil", "Electrical", "Chemical",
    "Computer Science and Engineering", "Electronics and Communication",
    "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
]

INSTITUTION_KEYWORDS = [
    "IIT", "NIT", "BITS", "VIT", "SRM", "MIT", "IIM", "ISB",
    "Institute of Technology", "University", "College", "School of",
    "Polytechnic", "Engineering College",
]

CGPA_PATTERNS = [
    re.compile(r"(?:CGPA|CPI|GPA|cgpa)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*/\s*(\d{1,2}(?:\.\d{1,2})?)", re.IGNORECASE),
    re.compile(r"(\d{1,2}(?:\.\d{1,2})?)\s*/\s*(\d{1,2}(?:\.\d{1,2})?)\s*CGPA", re.IGNORECASE),
    re.compile(r"(\d{1,2}(?:\.\d{1,2})?)\s*/\s*10(?:\s|\.|,|$)", re.IGNORECASE),
    re.compile(r"(?:CGPA|GPA)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)", re.IGNORECASE),
]

YEAR_PATTERN = re.compile(
    r"(?:20[0-2]\d|19[8-9]\d)"
)


def extract_education(text: str) -> list[EducationInfo]:
    """Extract education information from resume text."""
    results: list[EducationInfo] = []
    lines = text.split("\n")

    education_section = _extract_section(text, ["education", "academic", "qualification"])

    search_text = education_section if education_section else text

    degree = _find_degree(search_text)
    institution = _find_institution(search_text)
    department = _find_department(search_text)
    cgpa = _find_cgpa(search_text)
    year = _find_graduation_year(search_text)

    if degree or institution:
        college_cat = _categorize_college(institution) if institution else None
        results.append(EducationInfo(
            degree=degree,
            institution=institution,
            college_category=college_cat,
            department=department,
            cgpa=cgpa,
            graduation_year=year,
        ))

    return results


def _extract_section(text: str, keywords: list[str]) -> Optional[str]:
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if any(kw.lower() in line.lower() for kw in keywords):
            section_lines = []
            for j in range(i + 1, min(i + 15, len(lines))):
                next_line = lines[j].strip()
                if not next_line:
                    continue
                lower = next_line.lower()
                if any(kw in lower for kw in ["experience", "project", "skill", "certification", "contact", "summary"]):
                    break
                section_lines.append(next_line)
            if section_lines:
                return "\n".join(section_lines)
    return None


def _find_degree(text: str) -> Optional[str]:
    for degree in DEGREES:
        if degree.lower() in text.lower():
            if degree == "Bachelor of Technology":
                return "B.Tech"
            if degree == "Master of Technology":
                return "M.Tech"
            if degree == "Bachelor of Engineering":
                return "B.E."
            if degree == "Master of Engineering":
                return "M.E."
            if degree == "Bachelor of Science":
                return "B.Sc"
            if degree == "Master of Science":
                return "M.Sc"
            if degree == "Bachelor of Computer Applications":
                return "BCA"
            if degree == "Master of Computer Applications":
                return "MCA"
            return degree
    return None


def _find_institution(text: str) -> Optional[str]:
    lines = text.split("\n")
    for line in lines:
        line_stripped = line.strip()
        if len(line_stripped) < 5 or len(line_stripped) > 120:
            continue
        for keyword in INSTITUTION_KEYWORDS:
            if keyword.lower() in line_stripped.lower():
                return line_stripped.rstrip(",.").strip()
    return None


def _find_department(text: str) -> Optional[str]:
    for dept in DEPARTMENTS:
        if dept.lower() in text.lower():
            if "and Engineering" in dept:
                return dept.replace(" and Engineering", "")
            return dept
    return None


def _find_cgpa(text: str) -> Optional[float]:
    for pattern in CGPA_PATTERNS:
        match = pattern.search(text)
        if match:
            try:
                if match.lastindex and match.lastindex >= 2:
                    value = float(match.group(1))
                    max_val = float(match.group(2))
                    if max_val > 0:
                        normalized = (value / max_val) * 10.0
                        return round(min(normalized, 10.0), 2)
                else:
                    value = float(match.group(1))
                    return round(min(value, 10.0), 2)
            except (ValueError, IndexError):
                continue
    return None


def _find_graduation_year(text: str) -> Optional[int]:
    matches = YEAR_PATTERN.findall(text)
    for match in matches:
        year = int(match)
        if 1980 <= year <= 2030:
            return year
    return None


def _categorize_college(institution: str) -> str:
    tier1_keywords = ["IIT", "NIT", "BITS", "ISB", "IIM", "IISc"]
    tier2_keywords = ["VIT", "SRM", "Manipal", "MIT", "PEC", "JNTU", "Anna University", "Delhi Technological"]

    inst_upper = institution.upper()
    for kw in tier1_keywords:
        if kw.upper() in inst_upper:
            return "Tier-1"
    for kw in tier2_keywords:
        if kw.upper() in inst_upper:
            return "Tier-2"
    return "Tier-3"
