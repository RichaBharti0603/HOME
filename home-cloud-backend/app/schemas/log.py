from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class MonitorLogResponse(BaseModel):
    id: int
    monitor_id: int
    timestamp: datetime
    status: str
    response_time: Optional[int]
    error_message: Optional[str]
    dns_ms: Optional[int] = None
    tcp_ms: Optional[int] = None
    http_ms: Optional[int] = None
    ssl_issuer: Optional[str] = None
    ssl_days_remaining: Optional[int] = None
    tls_handshake_ms: Optional[int] = None
    ttfb_ms: Optional[int] = None
    redirects: Optional[int] = None

    class Config:
        from_attributes = True
