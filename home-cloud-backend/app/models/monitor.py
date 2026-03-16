from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True)

    url = Column(String)

    check_interval = Column(Integer)

    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="monitors")