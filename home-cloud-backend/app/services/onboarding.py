from datetime import datetime
from typing import Optional
from urllib.parse import urlparse

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.models.log import MonitorLog
from app.models.monitor import Monitor
from app.models.onboarding import MonitorPreferences, NotificationSettings, UserOnboarding
from app.models.user import User
from app.monitoring.checker import MonitoringEngine
from app.monitoring.validation import WebsiteRegistrationService
from app.schemas.onboarding import OnboardingSetupRequest


DEFAULT_MONITORING = {
    "uptime_monitoring_enabled": True,
    "ssl_monitoring_enabled": True,
    "performance_checks_enabled": True,
    "incident_logging_enabled": True,
    "default_interval_seconds": 60,
}


def normalize_website_url(raw_url: str) -> str:
    cleaned = (raw_url or "").strip()
    if not cleaned:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Please enter your website address.")

    if not cleaned.startswith(("http://", "https://")):
        cleaned = f"https://{cleaned}"

    parsed = urlparse(cleaned)
    if not parsed.hostname or "." not in parsed.hostname:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Please enter a valid website address.")

    return cleaned


def suggest_name_from_url(url: str) -> str:
    hostname = urlparse(url).hostname or "Website"
    domain = hostname.replace("www.", "").split(".")[0]
    return domain.replace("-", " ").replace("_", " ").title() or "My Website"


def _dashboard_payload(db: Session, user: User, monitor: Optional[Monitor] = None) -> dict:
    monitors = db.query(Monitor).filter(Monitor.tenant_id == user.tenant_id).order_by(Monitor.created_at.desc()).all()
    if monitor and all(existing.id != monitor.id for existing in monitors):
        monitors.insert(0, monitor)

    active_incident_counts = {}
    if monitors:
        ids = [m.id for m in monitors]
        incidents = db.query(Incident).filter(Incident.monitor_id.in_(ids), Incident.resolved_at.is_(None)).all()
        for incident in incidents:
            active_incident_counts[incident.monitor_id] = active_incident_counts.get(incident.monitor_id, 0) + 1

    return {
        "onboarding_complete": True,
        "monitors": [
            {
                "id": item.id,
                "project_name": item.project_name,
                "url": item.url,
                "status": item.status,
                "last_checked": item.last_checked.isoformat() if item.last_checked else None,
                "last_response_time": item.last_response_time,
                "uptime_percent": 100.0,
                "active_incidents": active_incident_counts.get(item.id, 0),
            }
            for item in monitors
        ],
        "primary_monitor_id": monitor.id if monitor else (monitors[0].id if monitors else None),
    }


def complete_onboarding(db: Session, user: User, data: OnboardingSetupRequest) -> dict:
    tenant = user.tenant
    if not tenant:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your workspace is not ready yet. Please sign in again.")

    normalized_url = normalize_website_url(data.url)
    validation_result = WebsiteRegistrationService.validate_and_enrich_website(normalized_url)
    if validation_result.get("error"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=validation_result["error"])

    normalized_url = validation_result.get("url", normalized_url)
    website_name = (data.project_name or "").strip() or suggest_name_from_url(normalized_url)

    existing_monitor = (
        db.query(Monitor)
        .filter(Monitor.tenant_id == tenant.id, Monitor.url == normalized_url)
        .first()
    )
    if existing_monitor and tenant.onboarding_complete:
        return _dashboard_payload(db, user, existing_monitor)

    onboarding = db.query(UserOnboarding).filter(UserOnboarding.user_id == user.id).first()
    if not onboarding:
        onboarding = UserOnboarding(user_id=user.id, tenant_id=tenant.id)
        db.add(onboarding)
        db.flush()

    onboarding.website_url = normalized_url
    onboarding.website_name = website_name[:160]
    onboarding.website_type = data.website_type
    onboarding.current_step = 4
    onboarding.completed = True
    onboarding.completed_at = datetime.utcnow()

    if not onboarding.monitor_preferences:
        onboarding.monitor_preferences = MonitorPreferences(user_id=user.id, tenant_id=tenant.id)
    onboarding.monitor_preferences.uptime_monitoring_enabled = True
    onboarding.monitor_preferences.ssl_monitoring_enabled = True
    onboarding.monitor_preferences.performance_checks_enabled = True
    onboarding.monitor_preferences.incident_logging_enabled = True
    onboarding.monitor_preferences.default_interval_seconds = 60
    onboarding.monitor_preferences.defaults = DEFAULT_MONITORING

    if not onboarding.notification_settings:
        onboarding.notification_settings = NotificationSettings(user_id=user.id, tenant_id=tenant.id)
    onboarding.notification_settings.notify_email = data.notify_email
    onboarding.notification_settings.notify_dashboard = data.notify_dashboard
    onboarding.notification_settings.alert_email = data.alert_email or user.email
    onboarding.notification_settings.weekly_reports = data.weekly_reports
    onboarding.notification_settings.whatsapp_number = data.whatsapp_number

    monitor = existing_monitor
    if not monitor:
        channels = []
        if data.notify_dashboard:
            channels.append("dashboard")
        if data.notify_email:
            channels.append("email")

        frequency_val = data.frequency if data.frequency else "60s"
        monitor = Monitor(
            tenant_id=tenant.id,
            user_id=user.id,
            project_name=website_name[:160],
            url=normalized_url,
            frequency=frequency_val,
            monitor_type="HTTP",
            check_types=["HTTP", "SSL", "PERFORMANCE", "INCIDENTS"],
            expected_status=200,
            alert_policy={
                "channels": channels or ["dashboard"],
                "emails": [data.alert_email or user.email] if data.notify_email else [],
                "weekly_reports": data.weekly_reports,
                "webhooks": [],
            },
            retry_policy={"max_retries": 3, "delay_seconds": 30},
            active_status=True,
            status="UNKNOWN",
            threshold_ms=2000,
        )
        db.add(monitor)
        db.flush()

    try:
        result = MonitoringEngine.run_full_check(normalized_url, expected_status=None)
        status_value = result.status.value.upper()
        monitor.status = status_value
        monitor.last_checked = datetime.utcnow()
        monitor.last_response_time = int(result.total_duration_ms or 0)
        db.add(
            MonitorLog(
                monitor_id=monitor.id,
                status=status_value,
                response_time=int(result.total_duration_ms or 0),
                error_message=None if status_value == "UP" else result.message,
                dns_ms=int(result.dns.duration_ms) if result.dns and result.dns.duration_ms else None,
                tcp_ms=int(result.tcp.duration_ms) if result.tcp and result.tcp.duration_ms else None,
                http_ms=int(result.http.response_time_ms) if result.http and result.http.response_time_ms else None,
                ssl_issuer=result.http.ssl_issuer if result.http else None,
                ssl_days_remaining=result.http.ssl_days_remaining if result.http else None,
                ttfb_ms=int(result.http.ttfb_ms) if result.http and result.http.ttfb_ms else None,
                redirects=result.http.redirects if result.http else None,
            )
        )
    except Exception:
        monitor.status = "UNKNOWN"

    monitor_ids = set(onboarding.created_monitor_ids or [])
    monitor_ids.add(monitor.id)
    onboarding.created_monitor_ids = list(monitor_ids)
    tenant.onboarding_complete = True
    user.onboarding_completed = True

    db.commit()
    db.refresh(monitor)
    return _dashboard_payload(db, user, monitor)
