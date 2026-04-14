# app/config.py
# WHY: Centralizing config means one place to change settings.
# Pydantic validates types at startup — you get instant errors
# if a required env var is missing, not silent bugs at runtime.

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    app_name: str = "H.O.M.E"
    app_env: str = "development"
    debug: bool = True

    # Database — PostgreSQL
    database_url: str = "postgresql://user:password@localhost:5432/home"

    # Redis — Celery uses this as its message broker
    redis_url: str = "redis://localhost:6379/0"

    # Email alert settings (used in Phase 6)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    alert_from_email: str = ""

    class Config:
        # Tell Pydantic to read from .env file
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra fields in .env without crashing
        extra = "ignore"


# lru_cache ensures we only read the .env file ONCE.
# Calling get_settings() 100 times = same object, no re-reading.
@lru_cache()
def get_settings() -> Settings:
    return Settings()