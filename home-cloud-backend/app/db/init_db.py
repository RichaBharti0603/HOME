from app.db.base import Base
from app.db.session import engine

# Import models so they are registered
from app.models.website import Website
from app.models.check_result import CheckResult
from app.models.alert import Alert

def init_db():
    Base.metadata.create_all(bind=engine)
