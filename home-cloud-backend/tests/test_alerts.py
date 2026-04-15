# tests/test_alerts.py
# Alert system unit tests
# Run with: python -m pytest tests/test_alerts.py -v

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.monitor import Monitor
from app.models.user import User
from app.alerts.models import (
    AlertPreference,
    MonitorState,
    AlertHistory,
    AlertThreshold,
)
from app.alerts.service import AlertService
from app.monitoring.schemas import CheckResult, CheckStatus, DNSResult, HTTPResult


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def setup_test_db():
    """Create test database with all tables"""
    Base.metadata.create_all(bind=engine)


def teardown_test_db():
    """Clean up test database"""
    Base.metadata.drop_all(bind=engine)


def get_test_db():
    """Get test database session"""
    return TestingSessionLocal()


def test_create_monitor_state():
    """Test creating monitor state (previous status tracking)"""
    setup_test_db()
    try:
        db = get_test_db()
        
        # Create test monitor
        monitor = Monitor(
            project_name="Test Project",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        # Get or create state
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        
        assert state.monitor_id == monitor.id
        assert state.previous_status == "UNKNOWN"
        assert state.consecutive_failures == 0
        
        print("✅ Monitor state creation: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_create_preferences():
    """Test creating default alert preferences"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        # Get or create preferences
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        
        assert prefs.monitor_id == monitor.id
        assert prefs.enable_email == True
        assert prefs.alert_on_down == True
        assert prefs.alert_cooldown_seconds == 1800
        
        print("✅ Alert preferences creation: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_state_change_detection():
    """Test detecting state changes (UP → DOWN)"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        # Create state
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        state.previous_status = "UP"
        db.commit()
        
        # Create fake check result (UP → DOWN)
        check_result = CheckResult(
            url="https://test.example.com",
            status=CheckStatus.DOWN,
            message="DNS failed",
            dns=DNSResult(success=False, error="NXDOMAIN"),
        )
        
        # Get preferences
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        thresholds = AlertService._get_thresholds(db)
        
        # Check if alert should be sent
        should_send, reason = AlertService._should_send_alert(
            db, state, prefs, "DOWN", thresholds
        )
        
        assert should_send == True, f"Expected alert, but: {reason}"
        assert "No status change" not in reason
        
        print("✅ State change detection: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_no_alert_without_state_change():
    """Test that no alert is sent if status doesn't change"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="DOWN"
        )
        db.add(monitor)
        db.commit()
        
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        state.previous_status = "DOWN"  # Already DOWN
        db.commit()
        
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        thresholds = AlertService._get_thresholds(db)
        
        should_send, reason = AlertService._should_send_alert(
            db, state, prefs, "DOWN", thresholds  # Still DOWN
        )
        
        assert should_send == False
        assert "No status change" in reason
        
        print("✅ No duplicate alert on unchanged status: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_cooldown_enforcement():
    """Test cooldown prevents alert spam"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        state.previous_status = "UP"
        state.last_alert_sent_at = datetime.now(timezone.utc)  # Just sent
        state.last_alert_status = "DOWN"
        db.commit()
        
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        prefs.alert_cooldown_seconds = 1800  # 30 minutes
        db.commit()
        
        thresholds = AlertService._get_thresholds(db)
        
        should_send, reason = AlertService._should_send_alert(
            db, state, prefs, "DOWN", thresholds
        )
        
        assert should_send == False
        assert "Cooldown active" in reason
        
        print("✅ Cooldown enforcement: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_user_preferences_disable_alerts():
    """Test that user preferences can disable alert types"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        state.previous_status = "UP"
        db.commit()
        
        # Disable DOWN alerts
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        prefs.alert_on_down = False
        db.commit()
        
        thresholds = AlertService._get_thresholds(db)
        
        should_send, reason = AlertService._should_send_alert(
            db, state, prefs, "DOWN", thresholds
        )
        
        assert should_send == False
        assert "alert_on_down" in reason or "User disabled" in reason
        
        print("✅ User preference enforcement: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_global_alerts_disabled():
    """Test that global disable overrides everything"""
    setup_test_db()
    try:
        db = get_test_db()
        
        monitor = Monitor(
            project_name="Test",
            url="https://test.example.com",
            frequency="daily",
            monitor_type="http",
            status="UP"
        )
        db.add(monitor)
        db.commit()
        
        state = AlertService._get_or_create_monitor_state(db, monitor.id)
        state.previous_status = "UP"
        db.commit()
        
        prefs = AlertService._get_or_create_preferences(db, monitor.id)
        
        # Disable alerts globally
        threshold = AlertService._get_thresholds(db)
        threshold.alerts_enabled = False
        db.commit()
        
        should_send, reason = AlertService._should_send_alert(
            db, state, prefs, "DOWN", threshold
        )
        
        assert should_send == False
        assert "globally disabled" in reason.lower()
        
        print("✅ Global disable enforcement: PASSED")
    finally:
        db.close()
        teardown_test_db()


def test_alert_severity_mapping():
    """Test mapping status to severity"""
    assert AlertService._get_alert_severity("UP") == "info"
    assert AlertService._get_alert_severity("DEGRADED") == "warning"
    assert AlertService._get_alert_severity("DOWN") == "critical"
    assert AlertService._get_alert_severity("UNKNOWN") == "warning"
    
    print("✅ Alert severity mapping: PASSED")


def test_check_details_extraction():
    """Test extracting details from check result"""
    check_result = CheckResult(
        url="https://test.example.com",
        status=CheckStatus.DOWN,
        message="HTTP failed",
        http=HTTPResult(
            success=False,
            status_code=500,
            response_time_ms=1234.5,
            error="Internal Server Error"
        ),
        total_duration_ms=1500.0
    )
    
    details = AlertService._build_check_details_dict(check_result)
    
    assert "HTTP Status Code" in details
    assert details["HTTP Status Code"] == 500
    assert "Response Time (ms)" in details
    assert details["Response Time (ms)"] == "1234.5"
    
    print("✅ Check details extraction: PASSED")


if __name__ == "__main__":
    print("=" * 60)
    print("  Alert System Tests")
    print("=" * 60)
    
    tests = [
        test_create_monitor_state,
        test_create_preferences,
        test_state_change_detection,
        test_no_alert_without_state_change,
        test_cooldown_enforcement,
        test_user_preferences_disable_alerts,
        test_global_alerts_disabled,
        test_alert_severity_mapping,
        test_check_details_extraction,
    ]
    
    passed = 0
    failed = 0
    
    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            print(f"❌ FAILED: {test_fn.__name__}")
            print(f"   {e}")
            failed += 1
        except Exception as e:
            print(f"💥 ERROR: {test_fn.__name__}")
            print(f"   {type(e).__name__}: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"  Results: {passed} passed, {failed} failed")
    print("=" * 60)
