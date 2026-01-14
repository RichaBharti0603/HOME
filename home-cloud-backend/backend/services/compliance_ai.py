from azure.ai.textanalytics import TextAnalyticsClient
from azure.core.credentials import AzureKeyCredential
from core.config import settings

client = TextAnalyticsClient(
    endpoint=settings.AZURE_LANGUAGE_ENDPOINT,
    credential=AzureKeyCredential(settings.AZURE_LANGUAGE_KEY)
)

def scan_compliance(text: str):
    result = client.recognize_pii_entities([text])[0]
    findings = [
        {
            "text": entity.text,
            "category": entity.category,
            "confidence": entity.confidence_score
        }
        for entity in result.entities
    ]
    return findings
