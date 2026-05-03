import socket
import ssl
import requests
from urllib.parse import urlparse
import dns.resolver
from ipaddress import ip_address

class WebsiteRegistrationService:
    @staticmethod
    def is_private_ip(ip: str) -> bool:
        try:
            return ip_address(ip).is_private or ip_address(ip).is_loopback
        except ValueError:
            return False

    @staticmethod
    def validate_and_enrich_website(url: str, allow_private: bool = True) -> dict:
        """
        Robust validation gate before saving a monitor to the database.
        Checks URL scheme, DNS resolution, IP validity, SSL, and HTTP connectivity.
        """
        # 1. Normalize URL
        url = url.strip()
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        try:
            parsed = urlparse(url)
            hostname = parsed.hostname
            scheme = parsed.scheme
            port = parsed.port or (443 if scheme == "https" else 80)
        except Exception as e:
            return {"error": "Invalid URL format. Please ensure it's a valid web address."}

        if not hostname:
            return {"error": "Could not extract hostname from URL. Make sure there are no typos."}

        # 2. Validate DNS
        resolver = dns.resolver.Resolver()
        resolver.lifetime = 5
        resolved_ip = None
        try:
            answers = resolver.resolve(hostname, "A")
            resolved_ip = answers[0].address
        except dns.resolver.NXDOMAIN:
            return {"error": f"DNS not found. The domain '{hostname}' does not exist."}
        except dns.resolver.NoAnswer:
            return {"error": f"No DNS A records found for '{hostname}'. It may not point to a server."}
        except Exception:
            # Fallback to gethostbyname if dnspython fails due to local networking weirdness
            try:
                resolved_ip = socket.gethostbyname(hostname)
            except Exception:
                return {"error": f"DNS resolution failed. The domain could not be resolved."}

        # 3. Prevent Private IPs for production security
        if not allow_private and resolved_ip and WebsiteRegistrationService.is_private_ip(resolved_ip):
            return {"error": "Private or local IP addresses are not allowed for security reasons."}

        # 4. Test Connectivity & Grab Metadata
        metadata = {
            "url": url,
            "hostname": hostname,
            "ip_address": resolved_ip,
            "server": "Unknown",
            "ssl_issuer": "N/A",
            "ssl_expiry_days": None,
            "error": None
        }

        headers = {"User-Agent": "Mozilla/5.0 (compatible; HOME-Monitor/1.0; +https://github.com/home)"}
        try:
            resp = requests.get(url, headers=headers, timeout=5, allow_redirects=True, verify=True)
            metadata["server"] = resp.headers.get("Server", "Hidden")
            metadata["url"] = resp.url # updated after redirects
        except requests.exceptions.SSLError:
            return {"error": "SSL invalid. The site has an expired, invalid, or self-signed certificate."}
        except requests.exceptions.ConnectionError:
            return {"error": "Website unreachable. Connection refused or server is down."}
        except requests.exceptions.Timeout:
            return {"error": "Website unreachable. Connection timed out."}
        except Exception:
            # We don't fail registration on general HTTP errors (like 500s or 403s), 
            # because users might want to monitor failing endpoints!
            pass

        # 5. Grab SSL details explicitly if HTTPS
        if scheme == "https":
            try:
                context = ssl.create_default_context()
                with socket.create_connection((hostname, port), timeout=3) as sock:
                    with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                        cert = ssock.getpeercert()
                        if cert:
                            issuer = dict(x[0] for x in cert.get('issuer', []))
                            metadata["ssl_issuer"] = issuer.get('organizationName') or issuer.get('commonName') or "Unknown"
                            not_after = cert.get('notAfter')
                            if not_after:
                                import datetime
                                expiry_date = datetime.datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                                metadata["ssl_expiry_days"] = (expiry_date - datetime.datetime.utcnow()).days
            except Exception:
                pass

        return metadata
