# app/alerts/schemas.py
# Pydantic schemas for alert API requests/responses

from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum
from typing import Optional, List


class AlertStatusEnum(str, Enum):
    TRIGGERED = "triggered"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"


class NotificationChannelEnum(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    SMS = "sms"


# ─────────────────────────────────────────────────────────────
# AlertPreference Schemas
# ─────────────────────────────────────────────────────────────

class AlertPreferenceBase(BaseModel):
    """Base alert preference schema"""
    monitor_id: int
    enable_email: bool = True
    enable_slack: bool = False
    enable_sms: bool = False
    email_address: Optional[str] = None
    slack_webhook_url: Optional[str] = None
    slack_user_id: Optional[str] = None
    sms_phone_number: Optional[str] = None
    alert_on_down: bool = True
    alert_on_degraded: bool = True
    alert_on_recovery: bool = True
    alert_cooldown_seconds: int = 1800  # 30 min


class AlertPreferenceCreate(AlertPreferenceBase):
    """Create alert preference"""
    pass


class AlertPreferenceUpdate(BaseModel):
    """Update alert preference"""
    enable_email: Optional[bool] = None
    enable_slack: Optional[bool] = None
    enable_sms: Optional[bool] = None
    email_address: Optional[str] = None
    slack_webhook_url: Optional[str] = None
    slack_user_id: Optional[str] = None
    sms_phone_number: Optional[str] = None
    alert_on_down: Optional[bool] = None
    alert_on_degraded: Optional[bool] = None
    alert_on_recovery: Optional[bool] = None
    alert_cooldown_seconds: Optional[int] = None


class AlertPreferenceResponse(AlertPreferenceBase):
    """Alert preference response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# AlertHistory Schemas
# ─────────────────────────────────────────────────────────────

class AlertHistoryBase(BaseModel):
    """Base alert history"""
    monitor_id: int
    previous_status: str
    current_status: str
    message: str
    check_details: Optional[dict] = None


class AlertHistoryResponse(AlertHistoryBase):
    """Alert history response"""
    id: int
    alert_status: AlertStatusEnum
    channels_triggered: List[str]
    triggered_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Alert Request Schemas (for manual alert triggers)
# ─────────────────────────────────────────────────────────────

class ManualAlertRequest(BaseModel):
    """Manually trigger an alert"""
    monitor_id: int
    message: str
    severity: str = "warning"  # info, warning, critical


class AcknowledgeAlertRequest(BaseModel):
    """Acknowledge an alert"""
    alert_history_id: int
    note: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Threshold Schemas
# ─────────────────────────────────────────────────────────────

class AlertThresholdUpdate(BaseModel):
    """Update alert thresholds"""
    response_time_threshold_ms: Optional[float] = None
    consecutive_failures_threshold: Optional[int] = None
    alert_cooldown_seconds: Optional[int] = None
    alerts_enabled: Optional[bool] = None


class AlertThresholdResponse(BaseModel):
    """Alert threshold response"""
    id: int
    response_time_threshold_ms: float
    consecutive_failures_threshold: int
    alert_cooldown_seconds: int
    alerts_enabled: bool
    updated_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────
# Internal Schemas (not exposed via API)
# ─────────────────────────────────────────────────────────────

class AlertPayload(BaseModel):
    """Internal: what gets sent to notification handlers"""
    monitor_id: int
    monitor_url: str
    previous_status: str
    current_status: str
    message: str
    timestamp: datetime
    check_details: Optional[dict] = None
    alert_severity: str = "warning"  # info, warning, critical
