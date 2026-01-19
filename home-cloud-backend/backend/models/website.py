from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from core.database import Base

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    url = Column(String, nullable=False)
    interval = Column(Integer, default=60)
    last_status = Column(String, default="UNKNOWN")
    last_checked = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
