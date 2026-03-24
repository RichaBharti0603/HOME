# tests/test_checker.py
# Run with: python -m pytest tests/test_checker.py -v
# Or manually: python tests/test_checker.py

import sys
import os

# Add project root to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.monitoring.checker import MonitoringEngine, check_dns, check_tcp, check_http
from app.monitoring.schemas import CheckStatus
import json


def print_result(result):
    """Pretty-print a CheckResult as JSON."""
    print(json.dumps(result.to_dict(), indent=2, default=str))
    print("─" * 60)


def test_healthy_site():
    """A real, live site should return UP."""
    print("\n🧪 TEST: Healthy site (https://httpbin.org)")
    result = MonitoringEngine.run_full_check("https://httpbin.org")
    print_result(result)
    assert result.status == CheckStatus.UP, f"Expected UP, got {result.status}"
    assert result.dns is not None and result.dns.success
    assert result.tcp is not None and result.tcp.success
    assert result.http is not None and result.http.success
    print("✅ PASSED")


def test_nonexistent_domain():
    """A fake domain should fail at DNS."""
    print("\n🧪 TEST: Non-existent domain")
    result = MonitoringEngine.run_full_check("https://this-domain-absolutely-does-not-exist-xyz.com")
    print_result(result)
    assert result.status == CheckStatus.DOWN
    assert result.dns is not None and not result.dns.success
    assert result.tcp is None   # Should be skipped
    assert result.http is None  # Should be skipped
    print("✅ PASSED")


def test_http_only_site():
    """HTTP (non-HTTPS) site check."""
    print("\n🧪 TEST: HTTP site (http://httpbin.org)")
    result = MonitoringEngine.run_full_check("http://httpbin.org")
    print_result(result)
    # httpbin redirects HTTP → HTTPS, so still UP
    assert result.status == CheckStatus.UP
    print("✅ PASSED")


def test_dns_only():
    """Test DNS check in isolation."""
    print("\n🧪 TEST: DNS check only (google.com)")
    result = check_dns("google.com")
    print(f"  IPs: {result.resolved_ips}")
    print(f"  Duration: {result.duration_ms}ms")
    assert result.success
    assert len(result.resolved_ips) > 0
    print("✅ PASSED")


def test_tcp_only():
    """Test TCP check in isolation."""
    print("\n🧪 TEST: TCP check only (google.com:443)")
    result = check_tcp("google.com", 443)
    print(f"  Success: {result.success}")
    print(f"  Duration: {result.duration_ms}ms")
    assert result.success
    print("✅ PASSED")


def test_http_only():
    """Test HTTP check in isolation."""
    print("\n🧪 TEST: HTTP check only")
    result = check_http("https://httpbin.org/status/200")
    print(f"  Status code: {result.status_code}")
    print(f"  Response time: {result.response_time_ms}ms")
    assert result.success
    assert result.status_code == 200
    print("✅ PASSED")


def test_http_500_error():
    """A 500 error should return DOWN."""
    print("\n🧪 TEST: HTTP 500 error")
    result = MonitoringEngine.run_full_check("https://httpbin.org/status/500")
    print_result(result)
    assert result.status == CheckStatus.DOWN
    assert result.http.status_code == 500
    print("✅ PASSED")


def test_http_404_error():
    """A 404 should also return DOWN (400+ are failures)."""
    print("\n🧪 TEST: HTTP 404 error")
    result = MonitoringEngine.run_full_check("https://httpbin.org/status/404")
    print_result(result)
    assert result.status == CheckStatus.DOWN
    assert result.http.status_code == 404
    print("✅ PASSED")


def test_to_dict_serialization():
    """Verify CheckResult serializes correctly to dict."""
    print("\n🧪 TEST: Serialization")
    result = MonitoringEngine.run_full_check("https://httpbin.org")
    d = result.to_dict()
    assert "url" in d
    assert "status" in d
    assert isinstance(d["status"], str)   # Enum should be string
    assert "checked_at" in d
    print("✅ PASSED")


if __name__ == "__main__":
    print("=" * 60)
    print("  H.O.M.E — Monitoring Engine Tests")
    print("=" * 60)
    
    tests = [
        test_dns_only,
        test_tcp_only,
        test_http_only,
        test_healthy_site,
        test_nonexistent_domain,
        test_http_only_site,
        test_http_500_error,
        test_http_404_error,
        test_to_dict_serialization,
    ]
    
    passed = 0
    failed = 0
    
    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            print(f"❌ FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"💥 ERROR: {type(e).__name__}: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"  Results: {passed} passed, {failed} failed")
    print("=" * 60)