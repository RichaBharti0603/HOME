from core.database import Base, engine

# Import all models so SQLAlchemy registers them
from models.website import Website
# (later you can add more models here)

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

if __name__ == "__main__":
    create_tables()
