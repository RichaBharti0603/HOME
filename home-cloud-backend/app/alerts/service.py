import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, List

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.alerts.models import (
    AlertPreference,
    MonitorState,
    AlertHistory,
    AlertThreshold,
    AlertStatus,
    NotificationChannel,
)
from app.alerts.schemas import AlertPayload
from app.alerts.notifiers import EmailNotifier, SlackNotifier, SMSNotifier
from app.models.monitor import Monitor
from app.monitoring.schemas import CheckStatus

logger = logging.getLogger(__name__)


class AlertService:
    
    @staticmethod
    def _get_or_create_monitor_state(db: Session, monitor_id: int) -> MonitorState:
        state = db.query(MonitorState).filter(MonitorState.monitor_id == monitor_id).first()
        if not state:
            state = MonitorState(
                monitor_id=monitor_id,
                previous_status="UNKNOWN",
                state_started_at=datetime.now(timezone.utc),
            )
            db.add(state)
            db.commit()
            db.refresh(state)
            logger.debug(f"Created monitor state for monitor {monitor_id}")
        return state
    
    @staticmethod
    def _get_or_create_preferences(db: Session, monitor_id: int) -> AlertPreference:
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs:
            prefs = AlertPreference(
                monitor_id=monitor_id,
                enable_email=True,
                enable_slack=False,
                enable_sms=False,
                alert_on_down=True,
                alert_on_degraded=True,
                alert_on_recovery=True,
            )
            db.add(prefs)
            db.commit()
            db.refresh(prefs)
            logger.debug(f"Created alert preferences for monitor {monitor_id}")
        return prefs
    
    @staticmethod
    def _get_thresholds(db: Session) -> AlertThreshold:
        threshold = db.query(AlertThreshold).first()
        if not threshold:
            threshold = AlertThreshold()
            db.add(threshold)
            db.commit()
            db.refresh(threshold)
            logger.debug("Created default alert thresholds")
        return threshold
    
    @staticmethod
    def _should_send_alert(
        db: Session,
        monitor_state: MonitorState,
        alert_prefs: AlertPreference,
        current_status: str,
        thresholds: AlertThreshold
    ) -> Tuple[bool, Optional[str]]:
        
        if not thresholds.alerts_enabled:
            return False, "Alerts globally disabled"
        
        previous_status = monitor_state.previous_status
        
        if previous_status == current_status:
            return False, "No status change"
        
        if current_status == "DOWN" and not alert_prefs.alert_on_down:
            return False, "DOWN alerts disabled"
        
        if current_status == "DEGRADED" and not alert_prefs.alert_on_degraded:
            return False, "DEGRADED alerts disabled"
        
        if current_status == "UP" and not alert_prefs.alert_on_recovery:
            return False, "Recovery alerts disabled"
        
        if monitor_state.last_alert_sent_at:
            cooldown_seconds = alert_prefs.alert_cooldown_seconds
            time_since_last = (datetime.now(timezone.utc) - monitor_state.last_alert_sent_at).total_seconds()
            
            if monitor_state.last_alert_status == current_status and time_since_last < cooldown_seconds:
                remaining = int(cooldown_seconds - time_since_last)
                return False, f"Cooldown active ({remaining}s remaining)"
        
        return True, "All checks passed"
    
    @staticmethod
    def _get_alert_severity(current_status: str) -> str:
        severity_map = {
            "UP": "info",
            "DEGRADED": "warning",
            "DOWN": "critical",
            "UNKNOWN": "warning",
        }
        return severity_map.get(current_status, "warning")
    
    @staticmethod
    def _build_check_details_dict(check_result) -> dict:
        Extract relevant details from check result for alert context.
        
        This is what gets displayed in alert emails/Slack messages.
        """
        details = {}
        
        # HTTP details
        if check_result.http:
            details["HTTP Status Code"] = check_result.http.status_code
            details["Response Time (ms)"] = f"{check_result.http.response_time_ms:.1f}"
            if check_result.http.error:
                details["HTTP Error"] = check_result.http.error
            details["SSL Valid"] = "Yes" if check_result.http.is_ssl_valid else "No"
        
        # TCP details
        if check_result.tcp:
            if check_result.tcp.error:
                details["TCP Error"] = check_result.tcp.error
        
        # DNS details
        if check_result.dns:
            if check_result.dns.resolved_ips:
                details["Resolved IPs"] = ", ".join(check_result.dns.resolved_ips)
            if check_result.dns.error:
                details["DNS Error"] = check_result.dns.error
        
        details["Total Duration (ms)"] = f"{check_result.total_duration_ms:.1f}"
        
        return details
    
    @staticmethod
    def send_alert(
        db: Session,
        monitor_id: int,
        check_result,
    ) -> bool:
        try:
            monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
            if not monitor:
                logger.warning(f"Monitor {monitor_id} not found")
                return False
            
            monitor_state = AlertService._get_or_create_monitor_state(db, monitor_id)
            alert_prefs = AlertService._get_or_create_preferences(db, monitor_id)
            thresholds = AlertService._get_thresholds(db)
            
            current_status = check_result.status.value
            previous_status = monitor_state.previous_status
            
            should_send, reason = AlertService._should_send_alert(
                db, monitor_state, alert_prefs, current_status, thresholds
            )
            
            logger.info(
                f"Alert Check | Monitor {monitor_id} | "
                f"{previous_status}→{current_status} | "
                f"Send: {should_send} ({reason})"
            )
            
            check_details = AlertService._build_check_details_dict(check_result)
            alert_severity = AlertService._get_alert_severity(current_status)
            
            alert_payload = AlertPayload(
                monitor_id=monitor_id,
                monitor_url=monitor.url,
                previous_status=previous_status,
                current_status=current_status,
                message=check_result.message,
                timestamp=datetime.now(timezone.utc),
                check_details=check_details,
                alert_severity=alert_severity,
            )
            
            channels_triggered = []
            if should_send:
                channels_triggered = AlertService._send_notifications(
                    alert_prefs, alert_payload
                )
            
            alert_history = AlertHistory(
                monitor_id=monitor_id,
                previous_status=previous_status,
                current_status=current_status,
                alert_status=AlertStatus.TRIGGERED.value if should_send else AlertStatus.SUPPRESSED.value,
                message=check_result.message,
                channels_triggered=channels_triggered,
                check_details=check_details,
            )
            db.add(alert_history)
            
            monitor_state.previous_status = current_status
            
            if should_send:
                monitor_state.last_alert_sent_at = datetime.now(timezone.utc)
                monitor_state.last_alert_status = current_status
            
            monitor_state.consecutive_failures = 1 if current_status == "DOWN" else 0
            monitor_state.state_started_at = datetime.now(timezone.utc)
            monitor_state.updated_at = datetime.now(timezone.utc)
            
            db.commit()
            
            if should_send:
                logger.info(
                    f"✅ Alert sent for monitor {monitor_id} | "
                    f"Channels: {', '.join(channels_triggered)}"
                )
            
            return should_send
        
        except Exception as e:
            logger.error(f"❌ Alert service error for monitor {monitor_id}: {type(e).__name__}: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def _send_notifications(
        alert_prefs: AlertPreference,
    @staticmethod
    def _send_notifications(
        alert_prefs: AlertPreference,
        alert_payload: AlertPayload
    ) -> List[str]:
        channels_triggered = []
        
        if alert_prefs.enable_email and alert_prefs.email_address:
            success = EmailNotifier.send(
                to_email=alert_prefs.email_address,
                monitor_url=alert_payload.monitor_url,
                previous_status=alert_payload.previous_status,
                current_status=alert_payload.current_status,
                message=alert_payload.message,
                check_details=alert_payload.check_details,
            )
            if success:
                channels_triggered.append(NotificationChannel.EMAIL.value)
        
        if alert_prefs.enable_slack and alert_prefs.slack_webhook_url:
            success = SlackNotifier.send(
                webhook_url=alert_prefs.slack_webhook_url,
                monitor_url=alert_payload.monitor_url,
                previous_status=alert_payload.previous_status,
                current_status=alert_payload.current_status,
                message=alert_payload.message,
                check_details=alert_payload.check_details,
            )
            if success:
                channels_triggered.append(NotificationChannel.SLACK.value)
        
        if alert_prefs.enable_sms and alert_prefs.sms_phone_number:
            success = SMSNotifier.send(
                phone_number=alert_prefs.sms_phone_number,
                monitor_url=alert_payload.monitor_url,
                previous_status=alert_payload.previous_status,
                current_status=alert_payload.current_status,
                message=alert_payload.message,
                check_details=alert_payload.check_details,
            )
            if success:
                channels_triggered.append(NotificationChannel.SMS.value)
        
        return channels_triggered
    
    @staticmethod
    def get_alert_history(
        db: Session,
        monitor_id: Optional[int] = None,
        limit: int = 50
    ) -> List[AlertHistory]:
        query = db.query(AlertHistory)
        if monitor_id:
            query = query.filter(AlertHistory.monitor_id == monitor_id)
        return query.order_by(desc(AlertHistory.triggered_at)).limit(limit).all()
    
    @staticmethod
    def acknowledge_alert(
        db: Session,
        alert_history_id: int,
        note: Optional[str] = None
    ) -> bool:
            note: Optional note from user
        
        Returns:
            True if successful
        """
        try:
            alert = db.query(AlertHistory).filter(
                AlertHistory.id == alert_history_id
            ).first()
            
            if not alert:
                logger.warning(f"Alert history {alert_history_id} not found")
                return False
            
            alert.alert_status = AlertStatus.ACKNOWLEDGED.value
            alert.acknowledged_at = datetime.now(timezone.utc)
            db.commit()
            
            logger.info(f"Alert {alert_history_id} acknowledged")
            return True
        
        except Exception as e:
            logger.error(f"Failed to acknowledge alert: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def resolve_alert(
        db: Session,
        alert_history_id: int
    ) -> bool:
        """
        Mark an alert as resolved.
        
        Args:
            db: Database session
            alert_history_id: Alert to resolve
        
        Returns:
            True if successful
        """
        try:
            alert = db.query(AlertHistory).filter(
                AlertHistory.id == alert_history_id
            ).first()
            
            if not alert:
                logger.warning(f"Alert history {alert_history_id} not found")
                return False
            
            alert.alert_status = AlertStatus.RESOLVED.value
            alert.resolved_at = datetime.now(timezone.utc)
            db.commit()
            
            logger.info(f"Alert {alert_history_id} resolved")
            return True
        
        except Exception as e:
            logger.error(f"Failed to resolve alert: {e}")
            db.rollback()
            return False
