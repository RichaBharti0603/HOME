from backend.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True)
    website_id = Column(Integer, ForeignKey("websites.id"))

    started_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reason = Column(String)
