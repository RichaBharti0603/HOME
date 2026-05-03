# app/monitoring/schemas.py
# WHY: Before writing any check logic, define what a result LOOKS LIKE.
# This forces you to think about your data contract first.
# Every check returns a predictable, typed structure — no surprise dicts.

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class CheckStatus(str, Enum):
    """
    Possible outcomes for any monitoring check.
    
    WHY use Enum instead of raw strings?
    - Typo-proof: CheckStatus.UP vs "up" (what if you write "UP"?)
    - IDE autocomplete works
    - Easy to compare: result.status == CheckStatus.UP
    - str Enum means it serializes to "up", "down" etc. in JSON
    """
    UP = "up"           # Everything is fine
    DOWN = "down"       # Complete failure (DNS/TCP/HTTP all broken)
    DEGRADED = "degraded"  # Responding but with issues (slow, bad status code)
    UNKNOWN = "unknown"    # We couldn't determine status (unexpected error)


@dataclass
class DNSResult:
    """
    Result of a DNS resolution check.
    
    DNS check answers: "Does this domain name resolve to an IP address?"
    If DNS fails, there's NO point doing TCP or HTTP — they will also fail.
    """
    success: bool                          # Did DNS resolve?
    resolved_ips: list[str] = field(default_factory=list)  # IPs returned
    error: Optional[str] = None            # Error message if failed
    duration_ms: float = 0.0              # How long DNS lookup took


@dataclass
class TCPResult:
    """
    Result of a TCP connection check.
    
    TCP check answers: "Can we open a socket to host:port?"
    This tells us if the server is reachable at the network level,
    independent of what application is running on it.
    """
    success: bool
    host: str = ""
    port: int = 443
    error: Optional[str] = None
    duration_ms: float = 0.0


@dataclass
class HTTPResult:
    """
    Result of a full HTTP request.
    
    HTTP check answers: "Does the web server respond correctly?"
    This is the most information-rich check — status codes, headers,
    response time, redirect chains, SSL validity.
    """
    success: bool
    status_code: Optional[int] = None      # e.g. 200, 301, 404, 500
    response_time_ms: float = 0.0          # Total request duration
    redirects: int = 0                     # Number of redirects followed
    final_url: Optional[str] = None        # URL after all redirects
    content_length: int = 0               # Response body size in bytes
    error: Optional[str] = None
    
    # Lightweight checks
    content_matched: Optional[bool] = None
    expected_status_matched: Optional[bool] = None
    
    # WHY track is_ssl_valid separately?
    # A site can return 200 OK but have an expired SSL cert.
    # That's a failure that HTTP status code alone won't catch.
    is_ssl_valid: Optional[bool] = None
    ssl_issuer: Optional[str] = None
    ssl_days_remaining: Optional[int] = None
    tls_handshake_ms: float = 0.0
    ttfb_ms: float = 0.0

@dataclass
class CheckResult:
    """
    The complete, unified result of monitoring a single URL.
    This is what gets stored in MongoDB and what triggers alerts.
    
    Design principle: One object contains the full story of a check.
    No need to join multiple tables/documents to understand what happened.
    """
    url: str                               # The URL that was checked
    status: CheckStatus                    # Overall verdict
    checked_at: datetime = field(         # When the check ran (UTC always)
        default_factory=lambda: datetime.now(timezone.utc)
    )
    
    # Individual check results (None if check was skipped)
    # WHY Optional? If DNS fails, we skip TCP and HTTP entirely.
    # We mark them as None rather than fabricating fake failure objects.
    dns: Optional[DNSResult] = None
    tcp: Optional[TCPResult] = None
    http: Optional[HTTPResult] = None
    
    # Human-readable summary of what happened
    # Example: "DNS resolution failed: NXDOMAIN"
    # Example: "HTTP 503: Service Unavailable (2341ms)"
    message: str = ""
    
    # Total end-to-end check duration
    total_duration_ms: float = 0.0

    def to_dict(self) -> dict:
        """
        Convert to dict for MongoDB storage.
        We manually serialize because dataclasses don't auto-serialize
        nested objects or Enums to JSON-safe dicts.
        """
        return {
            "url": self.url,
            "status": self.status.value,          # Enum → string
            "checked_at": self.checked_at,
            "message": self.message,
            "total_duration_ms": self.total_duration_ms,
            "dns": {
                "success": self.dns.success,
                "resolved_ips": self.dns.resolved_ips,
                "error": self.dns.error,
                "duration_ms": self.dns.duration_ms,
            } if self.dns else None,
            "tcp": {
                "success": self.tcp.success,
                "host": self.tcp.host,
                "port": self.tcp.port,
                "error": self.tcp.error,
                "duration_ms": self.tcp.duration_ms,
            } if self.tcp else None,
            "http": {
                "success": self.http.success,
                "status_code": self.http.status_code,
                "response_time_ms": self.http.response_time_ms,
                "redirects": self.http.redirects,
                "final_url": self.http.final_url,
                "content_length": self.http.content_length,
                "error": self.http.error,
                "is_ssl_valid": self.http.is_ssl_valid,
                "ssl_issuer": self.http.ssl_issuer,
                "ssl_days_remaining": self.http.ssl_days_remaining,
                "tls_handshake_ms": self.http.tls_handshake_ms,
                "ttfb_ms": self.http.ttfb_ms,
                "content_matched": self.http.content_matched,
                "expected_status_matched": self.http.expected_status_matched,
            } if self.http else None,
        }