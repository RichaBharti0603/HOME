from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) 
    project_name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    frequency = Column(String, nullable=False) # e.g., "30s"
    monitor_type = Column(String, nullable=False)
    
    check_types = Column(JSON, default=["HTTP"]) # HTTP, PERFORMANCE, SSL, LIGHTWEIGHT
    alert_policy = Column(JSON, default={"channels": ["dashboard"], "emails": [], "webhooks": []})
    retry_policy = Column(JSON, default={"max_retries": 3, "delay_seconds": 30})
    active_status = Column(Boolean, default=True)
    
    expected_status = Column(Integer, nullable=True)
    expected_keyword = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="UNKNOWN")
    last_checked = Column(DateTime, nullable=True)
    last_response_time = Column(Integer, nullable=True) # in ms
    threshold_ms = Column(Integer, default=2000) # threshold for SLOW alerts

    # Relationships
    incidents = relationship("Incident", back_populates="monitor", cascade="all, delete-orphan")
    logs = relationship("MonitorLog", backref="monitor_ref", cascade="all, delete-orphan")

