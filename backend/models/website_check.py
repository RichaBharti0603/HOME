from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class WebsiteCheck(Base):
    __tablename__ = "website_checks"

    id = Column(Integer, primary_key=True, index=True)
    website_id = Column(Integer, ForeignKey("websites.id"))
    status = Column(String)
    checked_at = Column(DateTime)

    website = relationship("Website", back_populates="checks")
