"""Extract certification information from resume text."""

import logging
import re
from typing import Optional

from ..models import CertificationInfo

logger = logging.getLogger(__name__)

CERT_ISSUERS = [
    "AWS", "Amazon", "Google", "Microsoft", "Azure", "Meta", "Coursera",
    "Udemy", "edX", "Oracle", "Cisco", "CompTIA", "IBM", "CNCF",
    "TensorFlow", "Databricks", "VMware", "Red Hat", "Salesforce",
    "LinkedIn", "Stanford", "MIT", "Harvard",
]

CERT_KEYWORDS = [
    "Certified", "Certification", "Certificate", "Certified Developer",
    "Certified Associate", "Certified Professional", "Certified Solutions",
    "Certified Cloud", "Professional Certificate",
]


def extract_certifications(text: str) -> list[CertificationInfo]:
    """Extract certification entries from resume text."""
    results: list[CertificationInfo] = []

    cert_section = _extract_section(text, ["certification", "certifications", "certificate", "certifications & courses"])

    search_text = cert_section if cert_section else text

    lines = [line.strip() for line in search_text.split("\n") if line.strip()]

    for line in lines:
        cert = _parse_cert_line(line)
        if cert:
            results.append(cert)

    return results[:10]


def _parse_cert_line(line: str) -> Optional[CertificationInfo]:
    if not any(kw.lower() in line.lower() for kw in CERT_KEYWORDS) and not any(issuer.lower() in line.lower() for issuer in CERT_ISSUERS):
        if not line.startswith(("•", "-", "*", "▸", "▪")):
            return None

    name = None
    issuer = None
    year = None

    year_match = re.search(r"(20[0-2]\d)", line)
    if year_match:
        year = int(year_match.group(1))

    for ci in CERT_ISSUERS:
        if ci.lower() in line.lower():
            issuer = ci
            break

    name_match = re.search(
        r"(?:Certified|Certification|Certificate)\s+(.+?)(?:\s+[-–—from|by|,|–|\(|\d{4}|$)",
        line,
        re.IGNORECASE,
    )
    if name_match:
        name = name_match.group(1).strip().rstrip(",.")
    else:
        clean = re.sub(r"^(•\s*|-\s*|\*\s*)", "", line).strip()
        clean = re.sub(r"\s*\(.*?\)", "", clean)
        clean = re.sub(r"\s*\d{4}.*$", "", clean)
        clean = re.sub(r"\s*[-–—].*$", "", clean)
        if clean and len(clean) > 5:
            name = clean

    if not name:
        return None

    return CertificationInfo(
        name=name,
        issuer=issuer,
        year=year,
    )


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
                if any(kw in lower for kw in ["experience", "education", "project", "skill", "contact", "summary", "objective"]):
                    break
                section_lines.append(next_line)
            if section_lines:
                return "\n".join(section_lines)
    return None
