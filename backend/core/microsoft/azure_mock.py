def analyze_sentiment(text: str) -> dict:
    # Mocked Azure Text Analytics
    return {
        "sentiment": "neutral",
        "confidence": 0.82
    }

def detect_risk(text: str) -> dict:
    # Mocked Azure Compliance / Safety
    risky_keywords = ["suicide", "kill", "die"]
    detected = any(word in text.lower() for word in risky_keywords)

    return {
        "risk_detected": detected,
        "severity": "high" if detected else "low"
    }
