import time
import socket
import dns.resolver
from ping3 import ping
from loguru import logger
from typing import Dict, Any

class NetworkChecker:
    @staticmethod
    def check_dns(hostname: str) -> Dict[str, Any]:
        start_time = time.perf_counter()
        try:
            resolver = dns.resolver.Resolver()
            resolver.lifetime = 5
            answers = resolver.resolve(hostname, 'A')
            duration = (time.perf_counter() - start_time) * 1000
            return {
                "success": True,
                "dns_time": round(duration, 2),
                "resolved_ips": [str(rdata) for rdata in answers]
            }
        except Exception as e:
            return {
                "success": False,
                "dns_time": round((time.perf_counter() - start_time) * 1000, 2),
                "error": str(e)
            }

    @staticmethod
    def check_ping(hostname: str) -> Dict[str, Any]:
        """
        ICMP Ping. Note: Requires root/admin on some systems.
        """
        try:
            latency = ping(hostname, unit='ms', timeout=2)
            if latency is None:
                return {"success": False, "latency": None, "error": "Timeout"}
            return {"success": True, "latency": round(latency, 2)}
        except Exception as e:
            logger.error(f"Ping failed for {hostname}: {e}")
            return {"success": False, "latency": None, "error": str(e)}

    @staticmethod
    def check_tcp(hostname: str, port: int = 80) -> Dict[str, Any]:
        start_time = time.perf_counter()
        try:
            with socket.create_connection((hostname, port), timeout=5):
                duration = (time.perf_counter() - start_time) * 1000
                return {
                    "success": True,
                    "tcp_time": round(duration, 2)
                }
        except Exception as e:
            return {
                "success": False,
                "tcp_time": round((time.perf_counter() - start_time) * 1000, 2),
                "error": str(e)
            }

    @classmethod
    def run_all(cls, hostname: str) -> Dict[str, Any]:
        dns_res = cls.check_dns(hostname)
        ping_res = cls.check_ping(hostname)
        tcp_res = cls.check_tcp(hostname, 443 if "https" in hostname else 80)
        
        return {
            "dns_time": dns_res.get("dns_time"),
            "latency": ping_res.get("latency"),
            "tcp_time": tcp_res.get("tcp_time"),
            "reachable": dns_res["success"] and tcp_res["success"]
        }
