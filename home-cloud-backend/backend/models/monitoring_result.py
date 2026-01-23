from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from datetime import datetime
import uuid

from core.database import Base


class MonitoringResult(Base):
    __tablename__ = "monitoring_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    website_id = Column(String, ForeignKey("websites.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    status_code = Column(Integer)
    response_time_ms = Column(Float)
    error_type = Column(String)  # DNS, NETWORK, TIMEOUT, HTTP_ERROR, NONE

    checked_at = Column(DateTime, default=datetime.utcnow)
