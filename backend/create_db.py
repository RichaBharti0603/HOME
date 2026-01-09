# create_db.py
from backend.core.database import Base, engine
from backend.models import *  # make sure all your models are imported

# Create all tables in the database
Base.metadata.create_all(bind=engine)

print("Database and tables created successfully.")
