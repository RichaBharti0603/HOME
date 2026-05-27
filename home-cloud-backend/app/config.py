# app/config.py
# WHY: Centralizing config means one place to change settings.
# Pydantic validates types at startup — you get instant errors
# if a required env var is missing, not silent bugs at runtime.

from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import Field


class Settings(BaseSettings):
    # Application
    app_name: str = "H.O.M.E"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "HOME_SUPER_SECRET_KEY_PRODUCTION_GRADE"

    # Database — PostgreSQL
    database_url: str = "postgresql://user:password@localhost:5432/home"

    # Redis — Celery uses this as its message broker
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # AI Service URL (Local Ollama via Ngrok)
    ai_service_url: str = ""

    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:5173"
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        description="Comma-separated list of allowed browser origins.",
    )

    # API Base URL (for internal references if needed)
    api_base_url: str = "http://localhost:8000"

    # Email alert settings (used in Phase 6)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    alert_from_email: str = ""

    # Stripe Settings
    stripe_publishable_key: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        # Tell Pydantic to read from .env file
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow extra fields in .env without crashing
        extra = "ignore"
        # Support case-insensitive env vars
        case_sensitive = False

    from pydantic import model_validator

    @model_validator(mode='after')
    def fix_database_url(self):
        if self.database_url and self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)
        return self


# lru_cache ensures we only read the .env file ONCE.
# Calling get_settings() 100 times = same object, no re-reading.
@lru_cache()
def get_settings() -> Settings:
    return Settings()
