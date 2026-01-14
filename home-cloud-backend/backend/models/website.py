from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from core.database import Base

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    interval = Column(Integer, default=60)
    last_status = Column(String, default="UNKNOWN")
    last_checked = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
