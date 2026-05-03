from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class MonitorLog(Base):
    __tablename__ = "monitor_logs"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    response_time = Column(Integer, nullable=True) # ms
    error_message = Column(String, nullable=True)
    
    # Detailed metrics
    dns_ms = Column(Integer, nullable=True)
    tcp_ms = Column(Integer, nullable=True)
    http_ms = Column(Integer, nullable=True)
    
    # Extended metrics
    ssl_issuer = Column(String, nullable=True)
    ssl_days_remaining = Column(Integer, nullable=True)
    tls_handshake_ms = Column(Integer, nullable=True)
    ttfb_ms = Column(Integer, nullable=True)
    redirects = Column(Integer, nullable=True)
