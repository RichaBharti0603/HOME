import tldextract
import socket
from urllib.parse import urlparse
from .schemas import TargetValidation
import dns.resolver
from loguru import logger

class TargetManager:
    @staticmethod
    def normalize_url(url: str) -> str:
        """
        Ensures the URL has a scheme and is normalized.
        """
        if not url.startswith(('http://', 'https://')):
            url = f'https://{url}'
        
        parsed = urlparse(url)
        # Remove fragments and queries for the base monitor
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if normalized.endswith('/'):
            normalized = normalized[:-1]
        return normalized

    @staticmethod
    def validate_target(url: str) -> TargetValidation:
        """
        Parses URL and performs DNS pre-validation.
        """
        try:
            parsed_url = urlparse(url)
            hostname = parsed_url.hostname
            
            if not hostname:
                raise ValueError("Invalid hostname")

            # Extract TLD/Domain
            ext = tldextract.extract(url)
            
            # DNS Validation
            is_dns_valid = False
            resolved_ips = []
            try:
                answers = dns.resolver.resolve(hostname, 'A')
                resolved_ips = [str(rdata) for rdata in answers]
                is_dns_valid = len(resolved_ips) > 0
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.exception.Timeout):
                logger.warning(f"DNS validation failed for {hostname}")
                is_dns_valid = False
            except Exception as e:
                logger.error(f"Unexpected DNS error during validation: {e}")
                is_dns_valid = False

            return TargetValidation(
                domain=ext.domain,
                subdomain=ext.subdomain,
                tld=ext.suffix,
                is_dns_valid=is_dns_valid,
                resolved_ips=resolved_ips
            )
        except Exception as e:
            logger.error(f"Target validation failed: {e}")
            return TargetValidation(
                domain="",
                subdomain="",
                tld="",
                is_dns_valid=False,
                resolved_ips=[]
            )

    @staticmethod
    def get_monitoring_config(url: str):
        """
        Suggests monitoring config based on URL type.
        """
        # Placeholder for more complex logic
        return {
            "interval": "60s",
            "type": "http",
            "alert_policy": "default"
        }
