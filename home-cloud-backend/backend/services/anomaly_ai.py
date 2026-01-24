from azure.ai.anomalydetector import AnomalyDetectorClient
from azure.core.credentials import AzureKeyCredential
from backend.core.config import settings
from datetime import datetime

client = AnomalyDetectorClient(
    endpoint=settings.AZURE_ANOMALY_ENDPOINT,
    credential=AzureKeyCredential(settings.AZURE_ANOMALY_KEY)
)

def detect_anomaly(metrics: list):
    series = [
        {"timestamp": m["timestamp"], "value": m["value"]}
        for m in metrics
    ]

    response = client.detect_last_point(
        series=series,
        granularity="minutely"
    )
    return response.is_anomaly
