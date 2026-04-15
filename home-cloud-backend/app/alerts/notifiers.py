import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional

import requests
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailNotifier:
    
    @staticmethod
    def _format_email_body(
        monitor_url: str,
        previous_status: str,
        current_status: str,
        message: str,
        check_details: Optional[dict] = None,
        timestamp: Optional[datetime] = None
    ) -> str:
        if timestamp is None:
            timestamp = datetime.utcnow()
        
        status_change = f"{previous_status} → {current_status}"
        
        severity_color = {
            "up": "#28a745",
            "degraded": "#ffc107",
            "down": "#dc3545",
            "unknown": "#6c757d",
        }
        status_color = severity_color.get(current_status.lower(), "#999")
        
        details_html = ""
        if check_details:
            details_html = """
            <h3 style="color:#333; margin-top:20px;">Check Details:</h3>
            <table style="width:100%; border-collapse:collapse;">
            """
            for key, value in check_details.items():
                display_key = key.replace("_", " ").title()
                details_html += f"""
                <tr style="border-bottom:1px solid #ddd;">
                    <td style="padding:10px; text-align:right; font-weight:bold; width:40%;">{display_key}:</td>
                    <td style="padding:10px;">{value}</td>
                </tr>
                """
            details_html += "</table>"
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                    
                    <!-- Alert Status Box -->
                    <div style="background: {status_color}; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                        <h1 style="margin: 0;">🚨 ALERT: {current_status.upper()}</h1>
                        <p style="margin: 10px 0 0 0; font-size: 14px;">
                            Status changed from {previous_status.upper()} to {current_status.upper()}
                        </p>
                    </div>
                    
                    <!-- Monitor Info -->
                    <div style="background: white; padding: 15px; margin-bottom: 20px; border-left: 4px solid {status_color};">
                        <h2 style="margin-top: 0; color: #333;">Monitor Status Alert</h2>
                        <p><strong>Monitored URL:</strong> <code style="background:#f0f0f0; padding:2px 5px; border-radius:3px;">{monitor_url}</code></p>
                        <p><strong>Alert Time:</strong> {timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                        <p><strong>Status Change:</strong> {status_change}</p>
                    </div>
                    
                    <!-- Message -->
                    <div style="background: white; padding: 15px; margin-bottom: 20px; border-left: 4px solid #ddd;">
                        <h3 style="margin-top: 0;">Message:</h3>
                        <p>{message}</p>
                    </div>
                    
                    <!-- Check Details -->
                    {details_html}
                    
                    <!-- Footer -->
                    <div style="background: #f0f0f0; padding: 15px; margin-top: 20px; border-radius: 5px; font-size: 12px; color: #666; text-align: center;">
                        <p style="margin: 0;">
                            This is an automated alert from H.O.M.E Monitoring System.<br>
                            No reply needed — Please log in to your dashboard to acknowledge this alert.
                        </p>
                    </div>
                    
                </div>
            </body>
        </html>
        """
        
        return html_body
    
    @staticmethod  0
    def send(
        to_em0ail
        
        : str,
        monitor_url: str,
        previous_status: str,
        current_status: str,
        message: str,
        check_details: Optional[dict] = None
    ) -> bool:
        """
        Send alert email.
        
        Args:
            to_email: Recipient email address
            monitor_url: The URL being monitored
            previous_status: Previous status
            current_status: Current status
            message: Alert message
            check_details: Check result details
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            if not settings.smtp_user or not settings.smtp_password:
                logger.warning("⚠️  Email notifier: SMTP credentials not configured")
                return False
            
            # Create email
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"🚨 H.O.M.E Alert: {current_status.upper()} — {monitor_url}"
            msg["From"] = settings.alert_from_email or settings.smtp_user
            msg["To"] = to_email
            
            # HTML body
            html_body = EmailNotifier._format_email_body(
                monitor_url, previous_status, current_status, message, check_details
            )
            
            # Add HTML part
            msg.attach(MIMEText(html_body, "html"))
            
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent to {to_email} for {monitor_url}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {type(e).__name__}: {e}")
            return False


class SlackNotifier:
    
    @staticmethod
    def _format_slack_message(
        monitor_url: str,
        previous_status: str,
        current_status: str,
        message: str,
        check_details: Optional[dict] = None
    ) -> dict:
        status_color = {
            "up": "#28a745",
            "degraded": "#ffc107",
            "down": "#dc3545",
            "unknown": "#6c757d",
        }
        color = status_color.get(current_status.lower(), "#999")
        
        status_emoji = {
            "up": "✅",
            "degraded": "⚠️",
            "down": "🚨",
            "unknown": "❓"
        }
        emoji = status_emoji.get(current_status.lower(), "📍")
        
        detail_fields = []
        detail_fields = []
        if check_details:
            for key, value in check_details.items():
                display_key = key.replace("_", " ").title()
                detail_fields.append({
                    "type": "mrkdwn",
                    "text": f"*{display_key}:*\n{value}"
                })
        
        payload = {
            "text": f"H.O.M.E Alert: {current_status.upper()} for {monitor_url}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"{emoji} *H.O.M.E Monitoring Alert*"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {
                            "type": "mrkdwn",
                            "text": f"*Status Change:*\n{previous_status} → {current_status}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Monitor URL:*\n<{monitor_url}|{monitor_url}>"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"```\n{message}\n```"
                    }
                }
            ],
            "attachments": [
                {
                    "color": color,
                    "fields": [
                        {
                            "title": field["text"].split(":")[0] if ":" in field["text"] else "Details",
                            "value": field["text"],
                            "short": True
                        }
                        for field in detail_fields
                    ] if detail_fields else []
                }
            ]
        }
        
        return payload
    
    @staticmethod
    def send(
        webhook_url: str,
        monitor_url: str,
        previous_status: str,
        current_status: str,
        message: str,
        check_details: Optional[dict] = None
    ) -> bool:
        """
        Send alert via Slack webhook.
        
        Args:
            webhook_url: Slack Incoming Webhook URL
            monitor_url: The URL being monitored
            previous_status: Previous status
            current_status: Current status
            message: Alert message
            check_details: Check details dict
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            if not webhook_url:
                logger.warning("⚠️  Slack notifier: webhook URL not configured")
                return False
            
            payload = SlackNotifier._format_slack_message(
                monitor_url, previous_status, current_status, message, check_details
            )
            
            response = requests.post(
                webhook_url,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"💬 Slack notification sent for {monitor_url}")
                return True
            else:
                logger.error(f"❌ Slack webhook returned {response.status_code}: {response.text}")
                return False
        
        except Exception as e:
            logger.error(f"❌ Failed to send Slack notification: {type(e).__name__}: {e}")
            return False


# ─────────────────────────────────────────────────────────────
# SMS NOTIFIER (Optional)
# ─────────────────────────────────────────────────────────────

class SMSNotifier:
    """
    Send alerts via SMS using Twilio API.
    Requires: Twilio account and credentials in .env
    """
    
    @staticmethod
    def send(
        phone_number: str,
        monitor_url: str,
        previous_status: str,
        current_status: str,
        message: str,
        check_details: Optional[dict] = None
    ) -> bool:
        """
        Send alert via SMS (requires Twilio).
        
        Args:
            phone_number: Recipient phone number (+1234567890)
            monitor_url: The URL being monitored
            previous_status: Previous status
            current_status: Current status
            message: Alert message
            check_details: Check details (usually not sent via SMS)
        
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            # Check if Twilio is configured
            twilio_account_sid = getattr(settings, "twilio_account_sid", None)
            twilio_auth_token = getattr(settings, "twilio_auth_token", None)
            twilio_phone_from = getattr(settings, "twilio_phone_from", None)
            
            if not (twilio_account_sid and twilio_auth_token and twilio_phone_from):
                logger.warning("⚠️  SMS notifier: Twilio credentials not configured")
                return False
            
            # Avoid importing twilio unless configured (optional dependency)
            try:
                from twilio.rest import Client
            except ImportError:
                logger.warning("⚠️  SMS notifier: twilio library not installed")
                return False
            
            client = Client(twilio_account_sid, twilio_auth_token)
            
            # Build SMS message (keep short for SMS)
            sms_message = (
                f"🚨 H.O.M.E Alert: {current_status.upper()}\n"
                f"URL: {monitor_url}\n"
                f"{previous_status}→{current_status}\n"
                f"Message: {message[:100]}..."  # Truncate for SMS
            )
            
            message_obj = client.messages.create(
                body=sms_message,
                from_=twilio_phone_from,
                to=phone_number
            )
            
            logger.info(f"📱 SMS sent to {phone_number} for {monitor_url}")
            return True
        
        except Exception as e:
            logger.error(f"❌ Failed to send SMS: {type(e).__name__}: {e}")
            return False
