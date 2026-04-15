# app/alerts/__init__.py
# Alert system exports

from app.alerts.models import (
    AlertPreference,
    MonitorState,
    AlertHistory,
    AlertThreshold,
    AlertStatus,
    NotificationChannel,
)

from app.alerts.schemas import (
    AlertPreferenceCreate,
    AlertPreferenceUpdate,
    AlertPreferenceResponse,
    AlertHistoryResponse,
    AlertThresholdUpdate,
    AlertThresholdResponse,
    ManualAlertRequest,
    AcknowledgeAlertRequest,
    AlertPayload,
)

from app.alerts.service import AlertService
from app.alerts.notifiers import EmailNotifier, SlackNotifier, SMSNotifier

__all__ = [
    # Models
    "AlertPreference",
    "MonitorState", 
    "AlertHistory",
    "AlertThreshold",
    "AlertStatus",
    "NotificationChannel",
    # Schemas
    "AlertPreferenceCreate",
    "AlertPreferenceUpdate",
    "AlertPreferenceResponse",
    "AlertHistoryResponse",
    "AlertThresholdUpdate",
    "AlertThresholdResponse",
    "ManualAlertRequest",
    "AcknowledgeAlertRequest",
    "AlertPayload",
    # Service
    "AlertService",
    # Notifiers
    "EmailNotifier",
    "SlackNotifier",
    "SMSNotifier",
]
