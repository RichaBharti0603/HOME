from fastapi import APIRouter

router = APIRouter()

@router.get("/test-monitor")
def test_monitor():
    return {"message": "Monitor route working"}