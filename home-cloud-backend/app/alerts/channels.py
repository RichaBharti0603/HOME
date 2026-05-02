# app/alerts/channels.py

import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AlertChannel(ABC):
    @abstractmethod
    def send(self, recipient: str, title: str, message: str, context: Dict[str, Any] = None) -> bool:
        pass

class DashboardChannel(AlertChannel):
    """
    Simulates sending to the dashboard.
    In the real implementation, this is handled by database insertion (Alert model),
    which the frontend periodically polls or receives via WebSocket.
    """
    def send(self, recipient: str, title: str, message: str, context: Dict[str, Any] = None) -> bool:
        logger.info(f"[DASHBOARD] Alert sent to {recipient}: {title} - {message}")
        return True

class EmailChannel(AlertChannel):
    """
    Ready-architecture for Email integration (e.g., SendGrid, AWS SES).
    """
    def send(self, recipient: str, title: str, message: str, context: Dict[str, Any] = None) -> bool:
        if not recipient:
            return False
        logger.info(f"[EMAIL] Simulating email to {recipient}")
        logger.info(f"Subject: {title}")
        logger.info(f"Body: {message}")
        return True

class SMSChannel(AlertChannel):
    """
    Ready-architecture for SMS integration (e.g., Twilio).
    """
    def send(self, recipient: str, title: str, message: str, context: Dict[str, Any] = None) -> bool:
        if not recipient:
            return False
        logger.info(f"[SMS] Simulating SMS to {recipient}")
        logger.info(f"Message: {title} - {message}")
        return True

class WebhookChannel(AlertChannel):
    """
    Ready-architecture for Webhook integration (e.g., Slack, PagerDuty, custom endpoints).
    """
    def send(self, recipient: str, title: str, message: str, context: Dict[str, Any] = None) -> bool:
        if not recipient:
            return False
        # In a real app, we would use requests.post(recipient, json=...)
        logger.info(f"[WEBHOOK] Simulating POST to {recipient}")
        logger.info(f"Payload: {{'title': '{title}', 'message': '{message}'}}")
        return True
