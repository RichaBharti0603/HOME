from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserOnboarding(Base):
    __tablename__ = "user_onboardings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), unique=True)

    website_url = Column(String, nullable=True)
    website_name = Column(String, nullable=True)
    website_type = Column(String, nullable=True)

    current_step = Column(Integer, default=1)
    completed = Column(Boolean, default=False)
    created_monitor_ids = Column(JSON, default=list)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="onboarding")
    tenant = relationship("Tenant", backref="onboarding")
    monitor_preferences = relationship(
        "MonitorPreferences",
        back_populates="onboarding",
        uselist=False,
        cascade="all, delete-orphan",
    )
    notification_settings = relationship(
        "NotificationSettings",
        back_populates="onboarding",
        uselist=False,
        cascade="all, delete-orphan",
    )


class MonitorPreferences(Base):
    __tablename__ = "monitor_preferences"

    id = Column(Integer, primary_key=True, index=True)
    onboarding_id = Column(Integer, ForeignKey("user_onboardings.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), index=True, nullable=False)

    uptime_monitoring_enabled = Column(Boolean, default=True)
    ssl_monitoring_enabled = Column(Boolean, default=True)
    performance_checks_enabled = Column(Boolean, default=True)
    incident_logging_enabled = Column(Boolean, default=True)
    default_interval_seconds = Column(Integer, default=60)
    defaults = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    onboarding = relationship("UserOnboarding", back_populates="monitor_preferences")


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    onboarding_id = Column(Integer, ForeignKey("user_onboardings.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), index=True, nullable=False)

    notify_email = Column(Boolean, default=True)
    notify_dashboard = Column(Boolean, default=True)
    alert_email = Column(String, nullable=True)
    weekly_reports = Column(Boolean, default=False)
    whatsapp_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    onboarding = relationship("UserOnboarding", back_populates="notification_settings")
