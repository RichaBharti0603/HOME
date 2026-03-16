from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)

    name = Column(String)

    type = Column(String)

    user_id = Column(Integer, ForeignKey("users.id"))

    monitors = relationship("Monitor", back_populates="project")