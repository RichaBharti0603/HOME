from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Optional for now, but good for multi-tenancy
    project_name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    frequency = Column(String, nullable=False) # e.g., "30s"
    monitor_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    status = Column(String, default="UNKNOWN")
    last_checked = Column(DateTime, nullable=True)
    last_response_time = Column(Integer, nullable=True) # in ms
    threshold_ms = Column(Integer, default=2000) # threshold for SLOW alerts

    # Relationships
    incidents = relationship("Incident", back_populates="monitor", cascade="all, delete-orphan")
    logs = relationship("MonitorLog", backref="monitor_ref", cascade="all, delete-orphan")

