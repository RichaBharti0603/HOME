from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class CheckResult(Base):
    __tablename__ = "check_results"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"))
    status_code = Column(Integer)
    response_time = Column(Integer)
    checked_at = Column(DateTime, default=datetime.utcnow)

    website = relationship("Website")
