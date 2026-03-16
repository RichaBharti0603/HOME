from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved = Column(Boolean, default=False)
