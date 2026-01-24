from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from backend.core.database import Base
from datetime import datetime

class MonitorJob(Base):
    __tablename__ = "monitor_jobs"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)

    status = Column(String, default="pending")  
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)
