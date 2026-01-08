from fastapi import APIRouter
from backend.services.monitoring_service import register_website

router = APIRouter(prefix="/api/websites", tags=["Websites"])

@router.post("/")
def add_website(data: dict):
    url = data.get("url")
    if not url:
        return {"error": "URL is required"}

    website = register_website(url)
    return website
