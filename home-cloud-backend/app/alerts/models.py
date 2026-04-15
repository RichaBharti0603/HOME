from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Enum, ForeignKey, JSON
from datetime import datetime, timezone
from enum import Enum as PyEnum
from app.database import Base


class AlertStatus(str, PyEnum):
    TRIGGERED = "triggered"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"


class NotificationChannel(str, PyEnum):
    EMAIL = "email"
    SLACK = "slack"
    SMS = "sms"


class AlertPreference(Base):
    __tablename__ = "alert_preferences"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    
    enable_email = Column(Boolean, default=True)
    enable_slack = Column(Boolean, default=False)
    enable_sms = Column(Boolean, default=False)
    
    email_address = Column(String, nullable=True)
    slack_webhook_url = Column(String, nullable=True)
    slack_user_id = Column(String, nullable=True)
    sms_phone_number = Column(String, nullable=True)
    
    alert_on_down = Column(Boolean, default=True)
    alert_on_degraded = Column(Boolean, default=True)
    alert_on_recovery = Column(Boolean, default=True)
    
    alert_cooldown_seconds = Column(Integer, default=1800)
    
    # Created/updated timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class MonitorState(Base):
    """
    Tracks the PREVIOUS state of a monitor.
    Used to detect state changes (UP→DOWN, DEGRADED→UP, etc.)
class MonitorState(Base):
    __tablename__ = "monitor_states"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), unique=True, nullable=False)
    previous_status = Column(String, default="UNKNOWN")
    state_started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    consecutive_failures = Column(Integer, default=0)
    last_alert_sent_at = Column(DateTime, nullable=True)
    last_alert_status = Column(String, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    previous_status = Column(String)
    current_status = Column(String)
    alert_status = Column(String, default=AlertStatus.TRIGGERED.value)
    message = Column(String)
    channels_triggered = Column(JSON, default=[])
    check_details = Column(JSON)
    triggered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)


class AlertThreshold(Base):
    __tablename__ = "alert_thresholds"

    id = Column(Integer, primary_key=True, index=True)
    response_time_threshold_ms = Column(Float, default=5000.0)
    consecutive_failures_threshold = Column(Integer, default=3)
    alert_cooldown_seconds = Column(Integer, default=1800)
    alerts_enabled = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    alert_cooldown_seconds = Column(Integer, default=1800)  # 30 min
    
    # Global enable/disable
    alerts_enabled = Column(Boolean, default=True)
    
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
