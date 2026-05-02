# app/alerts/engine.py

import logging
from datetime import datetime, timedelta
from typing import Dict, Any

from sqlalchemy.orm import Session
from app.models.monitor import Monitor
from app.models.alert import Alert
from app.models.incident import Incident
from app.alerts.channels import DashboardChannel, EmailChannel, SMSChannel, WebhookChannel

logger = logging.getLogger(__name__)

class AlertPolicyEngine:
    def __init__(self, db: Session):
        self.db = db
        self.channels = {
            "dashboard": DashboardChannel(),
            "email": EmailChannel(),
            "sms": SMSChannel(),
            "webhook": WebhookChannel()
        }

    def process_incident(self, monitor: Monitor, incident: Incident, event_type: str, message: str) -> None:
        """
        Evaluate alert policies and dispatch alerts through configured channels.
        event_type should be "DOWN", "DEGRADED", or "RECOVERY"
        """
        policy = monitor.alert_policy or {}
        active_channels = policy.get("channels", ["dashboard"])
        
        # Cooldown check
        # To avoid spamming, we shouldn't send another alert of the same type too quickly.
        cooldown_minutes = policy.get("cooldown_minutes", 15)
        
        last_alert = self.db.query(Alert).filter(
            Alert.monitor_id == monitor.id,
            Alert.type == event_type
        ).order_by(Alert.timestamp.desc()).first()

        if last_alert and (datetime.utcnow() - last_alert.timestamp) < timedelta(minutes=cooldown_minutes):
            logger.info(f"Alert suppressed for monitor {monitor.id} ({event_type}) due to cooldown policy.")
            return

        # Create Database Alert (always used for Dashboard)
        db_alert = Alert(
            monitor_id=monitor.id,
            type=event_type,
            message=message
        )
        self.db.add(db_alert)
        self.db.commit()

        # Dispatch to other channels
        title = f"H.O.M.E. Alert: {monitor.project_name} is {event_type}"
        
        if "email" in active_channels:
            for email in policy.get("emails", []):
                self.channels["email"].send(email, title, message)
                
        if "sms" in active_channels:
            for phone in policy.get("phones", []):
                self.channels["sms"].send(phone, title, message)
                
        if "webhook" in active_channels:
            for webhook_url in policy.get("webhooks", []):
                self.channels["webhook"].send(webhook_url, title, message)
