import time
import requests
import ssl
import socket
from urllib.parse import urlparse
from typing import Dict, Any, Optional
from loguru import logger

class HTTPChecker:
    @staticmethod
    def get_ttfb(url: str, timeout: int = 10) -> Optional[float]:
        """
        Calculates Time To First Byte.
        """
        try:
            start = time.perf_counter()
            with requests.get(url, stream=True, timeout=timeout) as r:
                for chunk in r.iter_content(chunk_size=1):
                    ttfb = (time.perf_counter() - start) * 1000
                    return round(ttfb, 2)
        except Exception as e:
            logger.error(f"TTFB calculation failed: {e}")
            return None

    @staticmethod
    def check_tls(hostname: str, port: int = 443) -> Dict[str, Any]:
        """
        Measures TLS handshake time.
        """
        start_time = time.perf_counter()
        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, port), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    duration = (time.perf_counter() - start_time) * 1000
                    cert = ssock.getpeercert()
                    return {
                        "success": True,
                        "tls_time": round(duration, 2),
                        "issuer": dict(x[0] for x in cert.get('issuer', [])) if cert else None
                    }
        except Exception as e:
            return {
                "success": False,
                "tls_time": round((time.perf_counter() - start_time) * 1000, 2),
                "error": str(e)
            }

    @classmethod
    def run_full_http(cls, url: str) -> Dict[str, Any]:
        parsed = urlparse(url)
        hostname = parsed.hostname
        
        start_time = time.perf_counter()
        tls_info = {"tls_time": 0}
        if parsed.scheme == "https":
            tls_info = cls.check_tls(hostname)
        
        ttfb = cls.get_ttfb(url)
        
        try:
            response = requests.get(url, timeout=15)
            total_time = (time.perf_counter() - start_time) * 1000
            
            return {
                "status_code": response.status_code,
                "total_time": round(total_time, 2),
                "ttfb": ttfb,
                "tls_time": tls_info.get("tls_time"),
                "headers": dict(response.headers),
                "success": 200 <= response.status_code < 400
            }
        except Exception as e:
            return {
                "status_code": None,
                "total_time": round((time.perf_counter() - start_time) * 1000, 2),
                "ttfb": ttfb,
                "error": str(e),
                "success": False
            }
