# app/routes/alerts.py
# Alert management API endpoints

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.alerts import (
    AlertService,
    AlertPreference,
    AlertHistory,
    AlertThreshold,
    AlertPreferenceCreate,
    AlertPreferenceUpdate,
    AlertPreferenceResponse,
    AlertHistoryResponse,
    AlertThresholdUpdate,
    AlertThresholdResponse,
    ManualAlertRequest,
    AcknowledgeAlertRequest,
)
from app.models.monitor import Monitor

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# ─────────────────────────────────────────────────────────────
# ALERT PREFERENCES - User Configuration
# ─────────────────────────────────────────────────────────────

@router.get("/preferences/{monitor_id}", response_model=AlertPreferenceResponse)
def get_alert_preference(monitor_id: int, db: Session = Depends(get_db)):
    """
    Get alert preferences for a specific monitor.
    Creates default if doesn't exist.
    """
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        if not monitor:
            raise HTTPException(status_code=404, detail="Monitor not found")
        
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs:
            prefs = AlertPreference(monitor_id=monitor_id)
            db.add(prefs)
            db.commit()
            db.refresh(prefs)
        
        return prefs
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preferences", response_model=AlertPreferenceResponse)
def create_alert_preference(data: AlertPreferenceCreate, db: Session = Depends(get_db)):
    """
    Create alert preferences for a monitor.
    """
    try:
        monitor = db.query(Monitor).filter(Monitor.id == data.monitor_id).first()
        if not monitor:
            raise HTTPException(status_code=404, detail="Monitor not found")
        
        existing = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == data.monitor_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Preferences already exist for this monitor")
        
        prefs = AlertPreference(**data.dict())
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
        
        return prefs
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/preferences/{monitor_id}", response_model=AlertPreferenceResponse)
def update_alert_preference(
    monitor_id: int,
    data: AlertPreferenceUpdate,
    db: Session = Depends(get_db)
):
    """
    Update alert preferences for a monitor.
    """
    try:
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs:
            raise HTTPException(status_code=404, detail="Alert preferences not found")
        
        # Update only provided fields
        for field, value in data.dict(exclude_unset=True).items():
            setattr(prefs, field, value)
        
        db.commit()
        db.refresh(prefs)
        
        return prefs
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/preferences/{monitor_id}")
def delete_alert_preference(monitor_id: int, db: Session = Depends(get_db)):
    """
    Delete alert preferences (reverts to defaults).
    """
    try:
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs:
            raise HTTPException(status_code=404, detail="Alert preferences not found")
        
        db.delete(prefs)
        db.commit()
        
        return {"message": "Alert preferences deleted, defaults will apply"}
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ALERT HISTORY - Audit Log & Dashboard
# ─────────────────────────────────────────────────────────────

@router.get("/history", response_model=List[AlertHistoryResponse])
def get_alert_history(
    monitor_id: int = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Get alert history (audit log).
    
    Query parameters:
    - monitor_id: Filter by specific monitor (optional)
    - limit: Number of results (default: 50, max: 500)
    """
    try:
        alerts = AlertService.get_alert_history(db, monitor_id, limit)
        return alerts
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{alert_id}", response_model=AlertHistoryResponse)
def get_alert_detail(alert_id: int, db: Session = Depends(get_db)):
    """
    Get details of a specific alert.
    """
    try:
        alert = db.query(AlertHistory).filter(AlertHistory.id == alert_id).first()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return alert
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/acknowledge")
def acknowledge_alert(data: AcknowledgeAlertRequest, db: Session = Depends(get_db)):
    """
    Mark an alert as acknowledged.
    """
    try:
        success = AlertService.acknowledge_alert(db, data.alert_history_id, data.note)
        
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert acknowledged", "alert_id": data.alert_history_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resolve/{alert_id}")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """
    Mark an alert as resolved.
    """
    try:
        success = AlertService.resolve_alert(db, alert_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        return {"message": "Alert resolved", "alert_id": alert_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ALERT THRESHOLDS - Global Configuration
# ─────────────────────────────────────────────────────────────

@router.get("/thresholds", response_model=AlertThresholdResponse)
def get_alert_thresholds(db: Session = Depends(get_db)):
    """
    Get global alert thresholds.
    """
    try:
        threshold = db.query(AlertThreshold).first()
        
        if not threshold:
            threshold = AlertThreshold()
            db.add(threshold)
            db.commit()
            db.refresh(threshold)
        
        return threshold
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/thresholds", response_model=AlertThresholdResponse)
def update_alert_thresholds(data: AlertThresholdUpdate, db: Session = Depends(get_db)):
    """
    Update global alert thresholds.
    
    These apply system-wide unless overridden per monitor.
    """
    try:
        threshold = db.query(AlertThreshold).first()
        
        if not threshold:
            threshold = AlertThreshold()
            db.add(threshold)
        
        # Update only provided fields
        for field, value in data.dict(exclude_unset=True).items():
            setattr(threshold, field, value)
        
        db.commit()
        db.refresh(threshold)
        
        return threshold
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-email/{monitor_id}")
def test_email_alert(monitor_id: int, db: Session = Depends(get_db)):
    """
    Send a test email alert (useful for configuration verification).
    """
    try:
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs or not prefs.email_address:
            raise HTTPException(status_code=400, detail="Email not configured for this monitor")
        
        from app.alerts.notifiers import EmailNotifier
        
        success = EmailNotifier.send(
            to_email=prefs.email_address,
            monitor_url="https://test-monitor.example.com",
            previous_status="UP",
            current_status="DOWN",
            message="🧪 TEST EMAIL: This is a test alert to verify your configuration.",
            check_details={
                "Test": "Alert Configuration Working",
                "Timestamp": str(datetime.now(timezone.utc)),
            }
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send test email")
        
        return {"message": f"Test email sent to {prefs.email_address}"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-slack/{monitor_id}")
def test_slack_alert(monitor_id: int, db: Session = Depends(get_db)):
    """
    Send a test Slack alert (useful for configuration verification).
    """
    try:
        prefs = db.query(AlertPreference).filter(
            AlertPreference.monitor_id == monitor_id
        ).first()
        
        if not prefs or not prefs.slack_webhook_url:
            raise HTTPException(status_code=400, detail="Slack webhook not configured for this monitor")
        
        from app.alerts.notifiers import SlackNotifier
        from datetime import datetime, timezone
        
        success = SlackNotifier.send(
            webhook_url=prefs.slack_webhook_url,
            monitor_url="https://test-monitor.example.com",
            previous_status="UP",
            current_status="DOWN",
            message="🧪 TEST: This is a test alert to verify your Slack configuration.",
            check_details={
                "Test": "Slack Configuration Working",
                "Timestamp": str(datetime.now(timezone.utc)),
            }
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send test Slack message")
        
        return {"message": "Test Slack message sent"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Import datetime at top
from datetime import datetime, timezone
