def mock_anomaly_detection(data):
    threshold = sum(d["value"] for d in data) / len(data) * 1.5

    anomalies = [
        d for d in data if d["value"] > threshold
    ]

    return {
        "anomaly_detected": len(anomalies) > 0,
        "anomalies": anomalies
    }
