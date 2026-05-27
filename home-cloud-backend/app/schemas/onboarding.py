from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional

class OnboardingSetupRequest(BaseModel):
    url: str = Field(min_length=3, max_length=2048)
    project_name: Optional[str] = Field(default=None, max_length=160)
    website_type: str = Field(max_length=80)
    notify_email: bool = True
    notify_dashboard: bool = True
    alert_email: Optional[EmailStr] = None
    weekly_reports: bool = False
    frequency: Optional[str] = Field(default="60s", max_length=20)
    whatsapp_number: Optional[str] = Field(default=None, max_length=30)
    alert_sensitivity: Optional[str] = Field(default="Normal", max_length=20)

    @field_validator("url")
    @classmethod
    def clean_url(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Please enter your website address.")
        return cleaned

    @field_validator("website_type")
    @classmethod
    def validate_website_type(cls, value: str) -> str:
        # Relax validator to accept any string and specifically allow setup options
        return value.strip()

    @field_validator("alert_email", mode="before")
    @classmethod
    def clean_alert_email(cls, value):
        if isinstance(value, str):
            cleaned = value.strip().lower()
            return cleaned if cleaned else None
        return value


class OnboardingMonitorSummary(BaseModel):
    id: int
    project_name: str
    url: str
    status: str
    last_checked: Optional[str] = None
    last_response_time: Optional[int] = None
    uptime_percent: float = 100.0
    active_incidents: int = 0


class OnboardingSetupResponse(BaseModel):
    onboarding_complete: bool
    monitors: List[OnboardingMonitorSummary]
    primary_monitor_id: Optional[int] = None


class OnboardingStatusResponse(BaseModel):
    onboarding_completed: bool
    onboarding_complete: bool
    trial_ends_at: Optional[str] = None
    website_url: Optional[str] = None
    website_name: Optional[str] = None
    website_type: Optional[str] = None
    current_step: int = 1
    notify_email: bool = True
    notify_dashboard: bool = True
    alert_email: Optional[str] = None
    weekly_reports: bool = False
    created_monitor_ids: List[int] = Field(default_factory=list)
    whatsapp_number: Optional[str] = None
