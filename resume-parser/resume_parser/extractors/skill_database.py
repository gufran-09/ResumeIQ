"""Skill database and fuzzy matching using RapidFuzz."""

import logging
from functools import lru_cache

from rapidfuzz import fuzz, process

logger = logging.getLogger(__name__)

SKILL_DATABASE: list[str] = [
    # Languages
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Shell",
    "HTML", "CSS", "SQL",
    # Frontend
    "React", "Angular", "Vue.js", "Next.js", "Svelte", "Redux", "Tailwind CSS",
    "Bootstrap", "jQuery", "Sass", "Material UI",
    # Backend
    "Node.js", "Express", "Spring Boot", "Django", "Flask", "FastAPI",
    "ASP.NET", "Ruby on Rails", "Laravel", "Gin", "GraphQL", "gRPC",
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "Cassandra", "Elasticsearch", "DynamoDB", "Firebase", "Supabase",
    # Cloud / DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
    "Jenkins", "CI/CD", "GitHub Actions", "GitLab CI", "Ansible",
    "Nginx", "Apache",
    # Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Postman",
    # ML / Data
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
    "scikit-learn", "Pandas", "NumPy", "SciPy", "OpenCV", "NLP",
    "Data Science", "Big Data", "Spark", "Hadoop", "Kafka",
    # Mobile
    "Android", "iOS", "React Native", "Flutter",
    # Other
    "Microservices", "REST API", "WebSockets", "OAuth", "JWT",
    "Agile", "Scrum", "TDD", "Linux", "Bash",
]

MATCH_THRESHOLD = 85


@lru_cache(maxsize=1)
def _skill_index() -> tuple[str, ...]:
    return tuple(SKILL_DATABASE)


def match_skill(raw: str, threshold: int = MATCH_THRESHOLD) -> str | None:
    """Fuzzy-match a raw skill string against the skill database.

    Returns the canonical skill name if confidence >= threshold, else None.
    """
    raw_clean = raw.strip()
    if not raw_clean:
        return None

    result = process.extractOne(
        raw_clean,
        _skill_index(),
        scorer=fuzz.WRatio,
        score_cutoff=threshold,
    )
    if result:
        return result[0]
    return None


def extract_skills_from_text(text: str, threshold: int = MATCH_THRESHOLD) -> list[str]:
    """Scan text for known skills using fuzzy matching.

    Splits text by common delimiters and matches each token/phrase.
    """
    found: set[str] = set()

    lines = text.replace("\n", " ").replace("\t", " ")
    tokens = lines.split(",")
    for token in tokens:
        sub_tokens = token.split("/")
        for sub in sub_tokens:
            sub = sub.strip().strip("•-*()[]{}").strip()
            if len(sub) < 2:
                continue
            matched = match_skill(sub, threshold)
            if matched:
                found.add(matched)

    for skill in SKILL_DATABASE:
        lower_text = text.lower()
        if skill.lower() in lower_text:
            found.add(skill)

    return sorted(found)


def get_skill_database() -> dict:
    """Return the skill database grouped by category for the /skills endpoint."""
    return {
        "total": len(SKILL_DATABASE),
        "threshold": MATCH_THRESHOLD,
        "skills": SKILL_DATABASE,
    }
