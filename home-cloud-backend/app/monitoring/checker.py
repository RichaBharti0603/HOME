# app/monitoring/checker.py
# The core monitoring engine. No FastAPI, no Celery, no MongoDB.
# Pure Python. Fully testable in isolation.

import socket
import ssl
import time
import logging
from urllib.parse import urlparse
from typing import Optional

import dns.resolver
import dns.exception
import requests
from requests.exceptions import (
    ConnectionError,
    Timeout,
    TooManyRedirects,
    SSLError,
    RequestException,
)

from app.monitoring.schemas import (
    CheckResult,
    CheckStatus,
    DNSResult,
    TCPResult,
    HTTPResult,
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# CONSTANTS — centralized so they're easy to tune
# ─────────────────────────────────────────────────────────────

DNS_TIMEOUT_SECONDS = 5       # Max wait for DNS resolution
TCP_TIMEOUT_SECONDS = 5       # Max wait for TCP handshake
HTTP_TIMEOUT_SECONDS = 15     # Max wait for full HTTP response

# HTTP status codes we consider "healthy"
# 2xx = success, 3xx = redirects (we follow them)
# We do NOT include 4xx/5xx — those are failures
HEALTHY_STATUS_CODES = range(200, 400)

# Browser-like User-Agent — some sites block Python's default UA
# WHY: Sites like Cloudflare actively reject non-browser UAs.
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; HOME-Monitor/1.0; "
        "+https://github.com/your-repo/home)"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


# ─────────────────────────────────────────────────────────────
# HELPER: Timing context
# ─────────────────────────────────────────────────────────────

class Timer:
    """
    Simple context manager for measuring elapsed time in milliseconds.
    
    Usage:
        with Timer() as t:
            do_something()
        print(t.elapsed_ms)  # → 142.7
    
    WHY a context manager? It guarantees the stop time is captured
    even if an exception is raised inside the block.
    """
    def __enter__(self):
        self._start = time.perf_counter()  # perf_counter: highest resolution timer
        return self

    def __exit__(self, *args):
        self._end = time.perf_counter()

    @property
    def elapsed_ms(self) -> float:
        end = getattr(self, "_end", time.perf_counter())
        return round((end - self._start) * 1000, 2)


# ─────────────────────────────────────────────────────────────
# LAYER 1: DNS CHECK
# ─────────────────────────────────────────────────────────────

def check_dns(hostname: str) -> DNSResult:
    """
    Resolve the hostname to IP addresses using DNS.
    
    WHY dnspython instead of socket.getaddrinfo()?
    - dnspython gives us explicit timeout control
    - socket.getaddrinfo() can hang indefinitely on some systems
    - dnspython gives us the actual DNS error type (NXDOMAIN vs TIMEOUT etc.)
    
    Args:
        hostname: e.g. "google.com" (no scheme, no path)
    
    Returns:
        DNSResult with resolved IPs or error details
    """
    logger.debug(f"DNS check: {hostname}")
    
    resolver = dns.resolver.Resolver()
    resolver.lifetime = DNS_TIMEOUT_SECONDS   # Total time budget for resolution

    with Timer() as t:
        try:
            # Query for A records (IPv4 addresses)
            answers = resolver.resolve(hostname, "A")
            ips = [rdata.address for rdata in answers]
            
            logger.debug(f"DNS resolved {hostname} → {ips}")
            return DNSResult(
                success=True,
                resolved_ips=ips,
                duration_ms=t.elapsed_ms,
            )

        except dns.resolver.NXDOMAIN:
            # NXDOMAIN = "Non-Existent Domain"
            # The domain flat-out doesn't exist in DNS
            error = f"Domain does not exist (NXDOMAIN): {hostname}"
            logger.warning(error)
            return DNSResult(
                success=False,
                error=error,
                duration_ms=t.elapsed_ms,
            )

        except dns.resolver.NoAnswer:
            # Domain exists but has no A records
            # Unusual — might be a domain with only MX/AAAA records
            error = f"No DNS A records found for: {hostname}"
            logger.warning(error)
            return DNSResult(
                success=False,
                error=error,
                duration_ms=t.elapsed_ms,
            )

        except dns.exception.Timeout:
            error = f"DNS resolution timed out after {DNS_TIMEOUT_SECONDS}s: {hostname}"
            logger.warning(error)
            return DNSResult(
                success=False,
                error=error,
                duration_ms=t.elapsed_ms,
            )

        except Exception as e:
            # Catch-all for unexpected DNS errors
            error = f"DNS check failed unexpectedly: {type(e).__name__}: {e}"
            logger.error(error)
            return DNSResult(
                success=False,
                error=error,
                duration_ms=t.elapsed_ms,
            )


# ─────────────────────────────────────────────────────────────
# LAYER 2: TCP CHECK
# ─────────────────────────────────────────────────────────────

def check_tcp(host: str, port: int) -> TCPResult:
    """
    Attempt to open a TCP socket connection to host:port.
    
    WHY do a TCP check if HTTP exists?
    HTTP requires a working TCP connection. If TCP fails,
    we know the problem is at the NETWORK level, not the app level.
    This helps pinpoint root cause faster.
    
    A successful TCP check means:
    - The server's IP is reachable
    - The port is open and accepting connections
    - Firewall is not blocking us
    
    Args:
        host: Resolved hostname or IP, e.g. "google.com"
        port: TCP port, typically 80 (HTTP) or 443 (HTTPS)
    
    Returns:
        TCPResult with success status and timing
    """
    logger.debug(f"TCP check: {host}:{port}")

    with Timer() as t:
        try:
            # socket.create_connection handles:
            # - DNS resolution (if needed)
            # - TCP SYN/SYN-ACK/ACK handshake
            # - Timeout enforcement
            with socket.create_connection(
                (host, port),
                timeout=TCP_TIMEOUT_SECONDS
            ) as sock:
                # If we reach here, TCP handshake succeeded
                # We close the socket immediately — we just needed proof of life
                logger.debug(f"TCP connection to {host}:{port} succeeded")
                return TCPResult(
                    success=True,
                    host=host,
                    port=port,
                    duration_ms=t.elapsed_ms,
                )

        except socket.timeout:
            error = f"TCP connection timed out after {TCP_TIMEOUT_SECONDS}s: {host}:{port}"
            logger.warning(error)
            return TCPResult(
                success=False,
                host=host,
                port=port,
                error=error,
                duration_ms=t.elapsed_ms,
            )

        except ConnectionRefusedError:
            # Port is closed — server actively rejected our connection
            error = f"TCP connection refused (port closed): {host}:{port}"
            logger.warning(error)
            return TCPResult(
                success=False,
                host=host,
                port=port,
                error=error,
                duration_ms=t.elapsed_ms,
            )

        except OSError as e:
            # Covers: network unreachable, host unreachable, etc.
            error = f"TCP connection failed: {type(e).__name__}: {e}"
            logger.warning(error)
            return TCPResult(
                success=False,
                host=host,
                port=port,
                error=error,
                duration_ms=t.elapsed_ms,
            )


# ─────────────────────────────────────────────────────────────
# LAYER 3: HTTP CHECK
# ─────────────────────────────────────────────────────────────

def check_http(url: str, expected_status: Optional[int] = None, expected_keyword: Optional[str] = None) -> HTTPResult:
    """
    Perform a full HTTP GET request and analyze the response.
    
    WHY GET instead of HEAD?
    HEAD is faster (no body), but many servers return different
    status codes for HEAD vs GET, or don't support HEAD at all.
    GET gives us the actual content we can later hash for content monitoring.
    
    WHY requests library instead of httpx (async)?
    Celery workers are synchronous by default. Using sync requests
    is simpler and avoids event loop complexity in worker processes.
    
    Args:
        url: Full URL including scheme, e.g. "https://example.com"
    
    Returns:
        HTTPResult with status, timing, and SSL info
    """
    logger.debug(f"HTTP check: {url}")

    with Timer() as t:
        try:
            response = requests.get(
                url,
                headers=REQUEST_HEADERS,
                timeout=(
                    TCP_TIMEOUT_SECONDS,    # Connection timeout (TCP handshake)
                    HTTP_TIMEOUT_SECONDS,   # Read timeout (waiting for response body)
                ),
                # WHY allow_redirects=True?
                # We want to follow redirects (301, 302) and check the FINAL destination.
                # Most sites redirect HTTP → HTTPS, www → non-www, etc.
                allow_redirects=True,
                # WHY verify=True (default)?
                # SSL cert validation. Don't disable this in production.
                # If a site has an invalid cert, that IS a failure worth reporting.
                verify=True,
            )

            # Count redirects (response.history holds the redirect chain)
            redirect_count = len(response.history)

            # Check SSL validity for HTTPS URLs
            # If we got here without SSLError, cert is valid
            is_ssl = url.lower().startswith("https://")
            
            # Determine success based on status code
            if expected_status:
                success = response.status_code == expected_status
                expected_status_matched = success
            else:
                success = response.status_code in HEALTHY_STATUS_CODES
                expected_status_matched = None

            # Determine keyword match
            content_matched = None
            if success and expected_keyword:
                content_matched = expected_keyword in response.text
                if not content_matched:
                    success = False
            
            logger.debug(
                f"HTTP {response.status_code} from {url} "
                f"in {t.elapsed_ms}ms (redirects: {redirect_count})"
            )

            error_msg = None
            if not success:
                if expected_status and expected_status_matched is False:
                    error_msg = f"HTTP {response.status_code}: Expected status {expected_status}"
                elif expected_keyword and content_matched is False:
                    error_msg = f"Keyword Validation Failed: '{expected_keyword}' not found in response"
                else:
                    error_msg = f"HTTP {response.status_code}: {response.reason}"

            return HTTPResult(
                success=success,
                status_code=response.status_code,
                response_time_ms=t.elapsed_ms,
                redirects=redirect_count,
                final_url=response.url,
                content_length=len(response.content),
                is_ssl_valid=True if is_ssl else None,  # None = not applicable
                error=error_msg,
                content_matched=content_matched,
                expected_status_matched=expected_status_matched,
            )

        except SSLError as e:
            # SSL handshake failed — expired cert, self-signed cert, hostname mismatch
            error = f"SSL certificate error: {e}"
            logger.warning(f"SSL error for {url}: {e}")
            return HTTPResult(
                success=False,
                error=error,
                response_time_ms=t.elapsed_ms,
                is_ssl_valid=False,
            )

        except Timeout:
            error = f"HTTP request timed out after {HTTP_TIMEOUT_SECONDS}s"
            logger.warning(f"Timeout for {url}")
            return HTTPResult(
                success=False,
                error=error,
                response_time_ms=t.elapsed_ms,
            )

        except TooManyRedirects:
            # Redirect loop detected (requests stops at 30 by default)
            error = "Too many redirects (possible redirect loop)"
            logger.warning(f"Redirect loop for {url}")
            return HTTPResult(
                success=False,
                error=error,
                response_time_ms=t.elapsed_ms,
            )

        except ConnectionError as e:
            # Network-level error during HTTP (DNS or TCP failed underneath)
            error = f"HTTP connection error: {e}"
            logger.warning(f"Connection error for {url}: {e}")
            return HTTPResult(
                success=False,
                error=error,
                response_time_ms=t.elapsed_ms,
            )

        except RequestException as e:
            # Catch-all for any other requests library error
            error = f"HTTP request failed: {type(e).__name__}: {e}"
            logger.error(f"Unexpected HTTP error for {url}: {e}")
            return HTTPResult(
                success=False,
                error=error,
                response_time_ms=t.elapsed_ms,
            )


# ─────────────────────────────────────────────────────────────
# ORCHESTRATOR: Full Check Pipeline
# ─────────────────────────────────────────────────────────────

class MonitoringEngine:
    """
    Orchestrates the full 3-layer check pipeline for a URL.
    
    This class is stateless — every method is effectively a pure function.
    WHY a class? Future phases will add config (custom timeout per monitor,
    expected status codes, etc.) as constructor parameters.
    """

    @staticmethod
    def _parse_url(url: str) -> tuple[str, str, int]:
        """
        Extract hostname, scheme, and port from a URL.
        
        Returns:
            (hostname, scheme, port) tuple
            e.g. "https://example.com" → ("example.com", "https", 443)
        
        WHY manual port inference?
        urlparse returns port=None when port isn't in the URL.
        We infer from the scheme (https=443, http=80).
        """
        parsed = urlparse(url)
        
        hostname = parsed.hostname or ""
        scheme = parsed.scheme.lower()
        
        # Explicit port in URL takes priority; otherwise infer from scheme
        if parsed.port:
            port = parsed.port
        elif scheme == "https":
            port = 443
        else:
            port = 80
        
        return hostname, scheme, port

    @classmethod
    def run_full_check(cls, url: str, expected_status: Optional[int] = None, expected_keyword: Optional[str] = None) -> CheckResult:
        """
        Run the complete DNS → TCP → HTTP monitoring pipeline.
        
        Pipeline logic:
        1. Run DNS check
           - If DNS fails → STOP. Return DOWN result immediately.
           - WHY stop early? TCP and HTTP WILL fail if DNS fails.
             Early exit saves time and gives cleaner error reporting.
        
        2. Run TCP check
           - If TCP fails → STOP. Return DOWN result.
           - WHY stop early? Same reasoning — HTTP can't work without TCP.
        
        3. Run HTTP check
           - If HTTP fails → Return DOWN result.
           - If HTTP succeeds but slow → Return DEGRADED result.
           - If all good → Return UP result.
        
        Args:
            url: Full URL to check, e.g. "https://example.com"
        
        Returns:
            CheckResult with complete check details
        """
        overall_start = time.perf_counter()
        
        logger.info(f"Starting full check for: {url}")

        # ── Parse URL ──────────────────────────────────────────
        try:
            hostname, scheme, port = cls._parse_url(url)
        except Exception as e:
            # Malformed URL
            return CheckResult(
                url=url,
                status=CheckStatus.UNKNOWN,
                message=f"Invalid URL format: {e}",
            )

        if not hostname:
            return CheckResult(
                url=url,
                status=CheckStatus.UNKNOWN,
                message="Could not extract hostname from URL",
            )

        # ── Layer 1: DNS ───────────────────────────────────────
        dns_result = check_dns(hostname)

        if not dns_result.success:
            total_ms = round((time.perf_counter() - overall_start) * 1000, 2)
            return CheckResult(
                url=url,
                status=CheckStatus.DOWN,
                dns=dns_result,
                tcp=None,      # Explicitly None — we skipped this
                http=None,     # Explicitly None — we skipped this
                message=f"DNS failed: {dns_result.error}",
                total_duration_ms=total_ms,
            )

        # ── Layer 2: TCP ───────────────────────────────────────
        tcp_result = check_tcp(hostname, port)

        if not tcp_result.success:
            total_ms = round((time.perf_counter() - overall_start) * 1000, 2)
            return CheckResult(
                url=url,
                status=CheckStatus.DOWN,
                dns=dns_result,
                tcp=tcp_result,
                http=None,     # Skipped
                message=f"TCP failed: {tcp_result.error}",
                total_duration_ms=total_ms,
            )

        # ── Layer 3: HTTP ──────────────────────────────────────
        http_result = check_http(url, expected_status=expected_status, expected_keyword=expected_keyword)

        total_ms = round((time.perf_counter() - overall_start) * 1000, 2)

        # ── Determine Overall Status ───────────────────────────
        if not http_result.success:
            status = CheckStatus.DOWN
            message = f"HTTP failed: {http_result.error}"

        elif http_result.response_time_ms > 5000:
            # Responding, but VERY slow (> 5 seconds)
            # WHY DEGRADED instead of DOWN?
            # The site is technically working — users can access it —
            # but the experience is terrible. Different alert severity.
            status = CheckStatus.DEGRADED
            message = (
                f"HTTP {http_result.status_code} but slow: "
                f"{http_result.response_time_ms}ms (threshold: 5000ms)"
            )

        elif http_result.is_ssl_valid is False:
            # SSL cert problem — site responds but cert is broken
            status = CheckStatus.DEGRADED
            message = "SSL certificate is invalid or expired"

        else:
            status = CheckStatus.UP
            message = (
                f"HTTP {http_result.status_code} in "
                f"{http_result.response_time_ms}ms"
            )

        result = CheckResult(
            url=url,
            status=status,
            dns=dns_result,
            tcp=tcp_result,
            http=http_result,
            message=message,
            total_duration_ms=total_ms,
        )

        logger.info(
            f"Check complete | {url} | Status: {status.value} | "
            f"Total: {total_ms}ms | {message}"
        )

        return result