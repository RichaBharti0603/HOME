from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from backend.core.database import Base

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    interval = Column(Integer, default=60)

    last_status = Column(String, default="UNKNOWN")
    last_checked = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)

    # 🔔 ALERT STATE (IMPORTANT)
    alert_sent = Column(Boolean, default=False)
    response_time_ms = Column(Integer, nullable=True)
    failure_type = Column(String, nullable=True)    