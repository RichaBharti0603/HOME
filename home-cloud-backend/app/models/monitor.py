from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    url = Column(String)
    monitor_type = Column(String)
    frequency = Column(String)

    user_id = Column(Integer, ForeignKey("users.id"))