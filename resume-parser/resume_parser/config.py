"""Application configuration loaded from environment variables."""

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


class Settings:
    host: str = os.getenv("PARSE_SERVICE_HOST", "0.0.0.0")
    port: int = int(os.getenv("PARSE_SERVICE_PORT", "8001"))
    spacy_model: str = os.getenv("SPACY_MODEL", "en_core_web_sm")
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    spring_boot_api_url: str = os.getenv("SPRING_BOOT_API_URL", "http://localhost:8080/api")

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
