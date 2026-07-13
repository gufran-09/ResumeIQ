"""Data normalization and standardization for parsed resume fields."""

import logging
import re
from typing import Optional

from ..models import ParsedResume

logger = logging.getLogger(__name__)


def normalize_parsed_resume(parsed: ParsedResume) -> ParsedResume:
    """Run all normalization steps on a parsed resume."""
    if parsed.name:
        parsed.name = normalize_name(parsed.name)
    if parsed.email:
        parsed.email = parsed.email.lower().strip()
    if parsed.phone:
        parsed.phone = normalize_phone(parsed.phone)
    if parsed.education:
        for edu in parsed.education:
            if edu.degree:
                edu.degree = normalize_degree(edu.degree)
            if edu.cgpa is not None:
                edu.cgpa = normalize_cgpa(edu.cgpa)
            if edu.institution:
                edu.institution = normalize_institution_name(edu.institution)
    if parsed.experience:
        for exp in parsed.experience:
            if exp.company:
                exp.company = normalize_company_name(exp.company)
            if exp.role:
                exp.role = normalize_role(exp.role)
    if parsed.skills:
        parsed.skills = normalize_skills(parsed.skills)
    if parsed.projects:
        for proj in parsed.projects:
            if proj.title:
                proj.title = normalize_project_title(proj.title)
            if proj.technologies:
                proj.technologies = normalize_skills(proj.technologies)
    if parsed.certifications:
        for cert in parsed.certifications:
            if cert.name:
                cert.name = normalize_cert_name(cert.name)
            if cert.issuer:
                cert.issuer = normalize_issuer(cert.issuer)

    return parsed


def normalize_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip().strip(".,")
    parts = [p.capitalize() for p in name.split(" ")]
    return " ".join(parts)


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"[^\d+]", "", phone)
    if digits.startswith("+"):
        return digits
    digits = re.sub(r"\D", "", digits)
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"+91{digits}"
    return f"+{digits}" if not digits.startswith("+") else digits


def normalize_cgpa(raw) -> Optional[float]:
    try:
        if isinstance(raw, str):
            raw = float(re.search(r"[\d.]+", raw).group())
        value = float(raw)
    except (AttributeError, ValueError, TypeError):
        return None

    if value > 10:
        if value <= 100:
            value = round(value / 9.5, 2)
        else:
            return None
    return round(value, 2)


def normalize_degree(degree: str) -> str:
    degree = degree.strip().strip(".,")
    replacements = {
        r"\bB\.?Tech\b": "B.Tech",
        r"\bM\.?Tech\b": "M.Tech",
        r"\bB\.?E\b": "B.E",
        r"\bM\.?E\b": "M.E",
        r"\bB\.?Sc\b": "B.Sc",
        r"\bM\.?Sc\b": "M.Sc",
        r"\bB\.?A\b": "B.A",
        r"\bM\.?A\b": "M.A",
        r"\bB\.?Com\b": "B.Com",
        r"\bM\.?Com\b": "M.Com",
        r"\bB\.?B\.?A\b": "BBA",
        r"\bM\.?B\.?A\b": "MBA",
        r"\bPh\.?D\b": "Ph.D",
        r"\bM\.?C\.?A\b": "MCA",
        r"\bB\.?C\.?A\b": "BCA",
        r"\bDiploma\b": "Diploma",
    }
    for pattern, replacement in replacements.items():
        degree = re.sub(pattern, replacement, degree, flags=re.IGNORECASE)
    return degree


def normalize_institution_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip().strip(".,")
    name = re.sub(r"\bIIT\b", "Indian Institute of Technology", name, flags=re.IGNORECASE)
    name = re.sub(r"\bNIT\b", "National Institute of Technology", name, flags=re.IGNORECASE)
    name = re.sub(r"\bIIM\b", "Indian Institute of Management", name, flags=re.IGNORECASE)
    name = re.sub(r"\bIIIT\b", "Indian Institute of Information Technology", name, flags=re.IGNORECASE)
    name = re.sub(r"\bBITS\b", "Birla Institute of Technology and Science", name, flags=re.IGNORECASE)
    return name.title().replace("Of", "of").replace("And", "and")


def normalize_company_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip().strip(".,")
    suffixes = ["Pvt Ltd", "Private Limited", "Ltd", "Limited", "Inc", "Corp", "Corporation", "LLC", "LLP", "Pvt"]
    for suffix in suffixes:
        name = re.sub(rf"\b{re.escape(suffix)}\b\.?$", "", name, flags=re.IGNORECASE).strip(" ,.")
    return name.title()


def normalize_role(role: str) -> str:
    role = re.sub(r"\s+", " ", role).strip().strip(".,")
    return role.title()


def normalize_skills(skills: list[str]) -> list[str]:
    normalized = []
    seen = set()
    for skill in skills:
        s = skill.strip().strip(".,")
        if not s:
            continue
        s = _standardize_skill_name(s)
        key = s.lower()
        if key not in seen:
            seen.add(key)
            normalized.append(s)
    return normalized


def _standardize_skill_name(skill: str) -> str:
    standard = {
        "js": "JavaScript",
        "javascript": "JavaScript",
        "ts": "TypeScript",
        "typescript": "TypeScript",
        "node": "Node.js",
        "nodejs": "Node.js",
        "node.js": "Node.js",
        "reactjs": "React",
        "react.js": "React",
        "react": "React",
        "nextjs": "Next.js",
        "next.js": "Next.js",
        "vuejs": "Vue.js",
        "vue.js": "Vue.js",
        "vue": "Vue.js",
        "angular": "Angular",
        "python3": "Python",
        "py": "Python",
        "django": "Django",
        "flask": "Flask",
        "fastapi": "FastAPI",
        "java": "Java",
        "kotlin": "Kotlin",
        "swift": "Swift",
        "go": "Go",
        "golang": "Go",
        "c++": "C++",
        "c": "C",
        "c#": "C#",
        "csharp": "C#",
        "dotnet": ".NET",
        ".net": ".NET",
        "asp.net": "ASP.NET",
        "springboot": "Spring Boot",
        "spring boot": "Spring Boot",
        "spring": "Spring",
        "postgres": "PostgreSQL",
        "postgresql": "PostgreSQL",
        "mysql": "MySQL",
        "mongodb": "MongoDB",
        "mongo": "MongoDB",
        "redis": "Redis",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "k8s": "Kubernetes",
        "aws": "AWS",
        "gcp": "GCP",
        "azure": "Azure",
        "html5": "HTML",
        "html": "HTML",
        "css3": "CSS",
        "css": "CSS",
        "sass": "Sass",
        "scss": "SCSS",
        "tailwind": "Tailwind CSS",
        "tailwindcss": "Tailwind CSS",
        "tailwind css": "Tailwind CSS",
        "bootstrap": "Bootstrap",
        "graphql": "GraphQL",
        "rest": "REST API",
        "rest api": "REST API",
        "tensorflow": "TensorFlow",
        "tf": "TensorFlow",
        "pytorch": "PyTorch",
        "pandas": "Pandas",
        "numpy": "NumPy",
        "scikit-learn": "scikit-learn",
        "sklearn": "scikit-learn",
        "machine learning": "Machine Learning",
        "ml": "Machine Learning",
        "deep learning": "Deep Learning",
        "dl": "Deep Learning",
        "nlp": "NLP",
        "ai": "Artificial Intelligence",
        "data science": "Data Science",
        "git": "Git",
        "github": "GitHub",
        "gitlab": "GitLab",
        "jenkins": "Jenkins",
        "ci/cd": "CI/CD",
        "cicd": "CI/CD",
        "linux": "Linux",
        "unix": "Unix",
        "bash": "Bash",
        "shell": "Shell Scripting",
    }
    return standard.get(skill.lower(), skill)


def normalize_project_title(title: str) -> str:
    title = re.sub(r"\s+", " ", title).strip().strip(".,")
    return title


def normalize_cert_name(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip().strip(".,")
    return name


def normalize_issuer(issuer: str) -> str:
    issuer = re.sub(r"\s+", " ", issuer).strip().strip(".,")
    return issuer
