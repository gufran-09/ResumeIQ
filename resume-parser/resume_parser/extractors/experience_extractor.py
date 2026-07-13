"""Extract work experience: company, role, duration, description."""

import logging
import re
from typing import Optional

from ..models import ExperienceInfo

logger = logging.getLogger(__name__)

COMPANY_KEYWORDS = [
    "Google", "Microsoft", "Amazon", "Apple", "Meta", "Facebook", "Netflix",
    "Flipkart", "Swiggy", "Zomato", "Paytm", "Razorpay", "Freshworks",
    "Zoho", "TCS", "Infosys", "Wipro", "Accenture", "IBM", "Oracle",
    "Intel", "Nvidia", "Adobe", "Salesforce", "Uber", "LinkedIn", "Twitter",
    "Startup", "Labs", "Technologies", "Systems", "Solutions", "Services",
    "Inc", "Ltd", "Pvt", "Corp",
]

ROLE_KEYWORDS = [
    "Software Engineer", "SDE", "Developer", "Intern", "Analyst",
    "Consultant", "Architect", "Lead", "Manager", "Designer",
    "Backend Developer", "Frontend Developer", "Full Stack Developer",
    "Data Scientist", "Data Engineer", "DevOps Engineer",
    "Machine Learning Engineer", "QA Engineer", "Test Engineer",
    "Engineering Intern", "Software Developer", "Associate",
    "Senior", "Junior", "Trainee",
]

DURATION_PATTERNS = [
    re.compile(r"(\d{1,2})\s*(?:years?|yrs?|y)\s*(?:(\d{1,2})\s*(?:months?|mos?|m))?", re.IGNORECASE),
    re.compile(r"(\d{1,2})\s*(?:months?|mos?|m)", re.IGNORECASE),
]

DATE_RANGE_PATTERN = re.compile(
    r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{1,2}/\d{4}|\d{4})"
    r"\s*[-–—to]+\s*"
    r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|\d{1,2}/\d{4}|\d{4}|Present|Current|Now)",
    re.IGNORECASE,
)


def extract_experience(text: str) -> list[ExperienceInfo]:
    """Extract work experience entries from resume text."""
    results: list[ExperienceInfo] = []

    exp_section = _extract_section(text, ["experience", "work", "employment", "professional"])

    search_text = exp_section if exp_section else text

    lines = [line.strip() for line in search_text.split("\n") if line.strip()]

    current_company: Optional[str] = None
    current_role: Optional[str] = None
    current_duration: int = 0
    current_desc_lines: list[str] = []

    for line in lines:
        company = _find_company(line)
        role = _find_role(line)
        duration = _find_duration(line)

        if company and not role:
            if current_company and current_duration > 0:
                results.append(ExperienceInfo(
                    company=current_company,
                    role=current_role,
                    duration_months=current_duration,
                    description=" ".join(current_desc_lines[:3]) if current_desc_lines else None,
                ))
            current_company = company
            current_role = None
            current_duration = duration or 0
            current_desc_lines = []
        elif role:
            current_role = role
            if duration:
                current_duration = duration
        elif duration and not current_duration:
            current_duration = duration
        elif len(line) > 20 and not any(kw in line for kw in ["education", "skill", "project"]):
            current_desc_lines.append(line)

    if current_company and current_duration > 0:
        results.append(ExperienceInfo(
            company=current_company,
            role=current_role,
            duration_months=current_duration,
            description=" ".join(current_desc_lines[:3]) if current_desc_lines else None,
        ))

    return results[:5]


def _extract_section(text: str, keywords: list[str]) -> Optional[str]:
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if any(kw.lower() in line.lower() for kw in keywords):
            section_lines = []
            for j in range(i + 1, min(i + 30, len(lines))):
                next_line = lines[j].strip()
                if not next_line:
                    continue
                lower = next_line.lower()
                if any(kw in lower for kw in ["education", "project", "skill", "certification", "contact", "summary", "objective"]):
                    break
                section_lines.append(next_line)
            if section_lines:
                return "\n".join(section_lines)
    return None


def _find_company(line: str) -> Optional[str]:
    if len(line) < 3 or len(line) > 100:
        return None
    for kw in COMPANY_KEYWORDS:
        if kw.lower() in line.lower():
            if any(c.isalpha() for c in line):
                return line.rstrip(",.").strip()
    return None


def _find_role(line: str) -> Optional[str]:
    for role in ROLE_KEYWORDS:
        if role.lower() in line.lower():
            return role
    return None


def _find_duration(line: str) -> int:
    for pattern in DURATION_PATTERNS:
        match = pattern.search(line)
        if match:
            try:
                if match.lastindex and match.lastindex >= 2 and match.group(2):
                    years = int(match.group(1))
                    months = int(match.group(2))
                    return years * 12 + months
                else:
                    val = int(match.group(1))
                    if "month" in line.lower() or "mos" in line.lower() or " m" in line.lower():
                        return val
                    return val * 12
            except (ValueError, IndexError):
                continue

    date_match = DATE_RANGE_PATTERN.search(line)
    if date_match:
        return _estimate_duration_from_dates(date_match.group(1), date_match.group(2))

    return 0


def _estimate_duration_from_dates(start: str, end: str) -> int:
    months_map = {
        "jan": 0, "feb": 1, "mar": 2, "apr": 3, "may": 4, "jun": 5,
        "jul": 6, "aug": 7, "sep": 8, "oct": 9, "nov": 10, "dec": 11,
    }

    def parse_date(date_str: str) -> tuple[int, int] | None:
        date_str = date_str.strip()
        for month_name, month_num in months_map.items():
            if month_name in date_str.lower():
                year_match = re.search(r"\d{4}", date_str)
                if year_match:
                    return (int(year_match.group()), month_num)
        year_match = re.search(r"(\d{1,2})/(\d{4})", date_str)
        if year_match:
            return (int(year_match.group(2)), int(year_match.group(1)) - 1)
        year_match = re.search(r"\d{4}", date_str)
        if year_match:
            return (int(year_match.group()), 0)
        return None

    start_parsed = parse_date(start)
    end_parsed = parse_date(end)

    if start_parsed and end_parsed:
        months = (end_parsed[0] - start_parsed[0]) * 12 + (end_parsed[1] - start_parsed[1])
        return max(months, 0)

    return 0


def calculate_total_experience(experiences: list[ExperienceInfo]) -> int:
    """Sum up all experience durations."""
    return sum(exp.duration_months or 0 for exp in experiences)
