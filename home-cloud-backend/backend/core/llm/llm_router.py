from backend.core.llm.ollama_client import generate_response
from backend.core.microsoft.azure_mock import analyze_sentiment, detect_risk

def process_prompt(prompt: str) -> dict:
    ai_response = generate_response(prompt)

    sentiment = analyze_sentiment(prompt)
    risk = detect_risk(prompt)

    return {
        "reply": ai_response,
        "sentiment": sentiment,
        "risk": risk
    }
