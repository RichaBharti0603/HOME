from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String, default="OPEN") # OPEN, RESOLVED
    severity = Column(String, default="CRITICAL") # CRITICAL, WARNING
    
    started_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    root_cause = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    # Relationships
    monitor = relationship("Monitor", back_populates="incidents")
