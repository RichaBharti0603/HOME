from fastapi import APIRouter
from services.anomaly_ai import detect_anomaly

router = APIRouter(prefix="/monitoring", tags=["Monitoring AI"])

@router.post("/anomaly")
def check_anomaly(metrics: list):
    is_anomaly = detect_anomaly(metrics)
    return {"anomaly_detected": is_anomaly}
