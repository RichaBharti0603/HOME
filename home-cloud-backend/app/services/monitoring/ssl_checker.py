import ssl
import socket
from datetime import datetime

def check_ssl(domain: str):
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(5)
            s.connect((domain, 443))
            cert = s.getpeercert()

        expiry_date = datetime.strptime(cert['notAfter'], "%b %d %H:%M:%S %Y %Z")

        return {
            "ssl_valid": expiry_date > datetime.utcnow(),
            "ssl_expiry": expiry_date
        }

    except Exception:
        return {
            "ssl_valid": False,
            "ssl_expiry": None
        }
