from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
