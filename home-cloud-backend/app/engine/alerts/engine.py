import time
from typing import List, Dict, Any, Optional
from loguru import logger
from sqlalchemy.orm import Session
from app.models.log import MonitorLog

class AlertEngine:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.cooldown_period = 3600  # 1 hour default

    def should_suppress(self, target_id: int, status: str) -> bool:
        """
        Check if an alert should be suppressed due to cooldown.
        """
        # Find the last alert of this type for this target
        last_alert = self.db.query(MonitorLog).filter(
            MonitorLog.monitor_id == target_id,
            MonitorLog.status == status
        ).order_by(MonitorLog.timestamp.desc()).first()

        if last_alert:
            from datetime import datetime
            diff = (datetime.utcnow() - last_alert.timestamp).total_seconds()
            if diff < self.cooldown_period:
                return True
        return False

    def process_incident(self, target_id: int, status: str, message: str):
        """
        Main entry point for processing incidents and triggering alerts.
        """
        if status not in ["DOWN", "DEGRADED", "RECOVERY"]:
            return

        if status != "RECOVERY" and self.should_suppress(target_id, status):
            logger.info(f"Alert suppressed for target {target_id} (cooldown active)")
            return

        severity = self.classify_severity(status)
        logger.info(f"Triggering {severity} alert for target {target_id}: {message}")
        
        self.send_notifications(target_id, severity, message)

    def classify_severity(self, status: str) -> str:
        if status == "DOWN":
            return "CRITICAL"
        if status == "DEGRADED":
            return "WARNING"
        if status == "RECOVERY":
            return "INFO"
        return "DEBUG"

    def send_notifications(self, target_id: int, severity: str, message: str):
        # Webhook
        self.trigger_webhook(target_id, severity, message)
        
        # Email
        self.send_email(target_id, severity, message)
        
        # WebSocket
        self.broadcast_websocket(target_id, severity, message)

    def trigger_webhook(self, target_id: int, severity: str, message: str):
        # Implementation for outbound webhooks
        pass

    def send_email(self, target_id: int, severity: str, message: str):
        # Implementation for SMTP
        pass

    def broadcast_websocket(self, target_id: int, severity: str, message: str):
        # Integration with WebSocket manager
        try:
            from app.utils.websocket_manager import manager
            # This would normally be async, but celery tasks are sync.
            # We can use a background task or just log it for now.
            logger.info(f"Broadcast: {message}")
        except Exception:
            pass
