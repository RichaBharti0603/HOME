from sqlalchemy import Column, Integer, String, DateTime
from backend.core.database import Base
import uuid
from sqlalchemy.orm import relationship
from backend.models.website_check import WebsiteCheck


class Website(Base):
    __tablename__ = "websites"

    id = Column(Integer, primary_key=True)
    url = Column(String, nullable=False)

    status = Column(String, default="unknown")      # up / down
    last_status = Column(String, default="unknown") # for comparison
    last_checked = Column(DateTime)

    owner_id = Column(Integer)

    public_token = Column(
        String,
        unique=True,
        default=lambda: uuid.uuid4().hex
    )
    checks = relationship("WebsiteCheck", back_populates="website", cascade="all, delete-orphan")

