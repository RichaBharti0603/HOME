from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    website_id = Column(Integer, ForeignKey("websites.id"))
    channel = Column(String)  # email | slack | whatsapp
    target = Column(String)   # email address / webhook
    enabled = Column(Boolean, default=True)
