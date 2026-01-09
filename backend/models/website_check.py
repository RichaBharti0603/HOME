from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class WebsiteCheck(Base):
    __tablename__ = "website_checks"

    id = Column(Integer, primary_key=True)
    website_id = Column(Integer, ForeignKey("websites.id"), nullable=False)
    status = Column(String, nullable=False)  # 'up' or 'down'
    response_time_ms = Column(Integer, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow)

    website = relationship("Website", back_populates="checks")
