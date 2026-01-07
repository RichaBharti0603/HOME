def mock_compliance_scan(text: str):
    findings = []

    if "credit card" in text.lower() or "4111" in text:
        findings.append({
            "entity": "CreditCardNumber",
            "risk": "HIGH",
            "regulation": ["PCI-DSS", "GDPR"]
        })

    if "email" in text.lower():
        findings.append({
            "entity": "Email",
            "risk": "MEDIUM",
            "regulation": ["GDPR"]
        })

    return {
        "safe": len(findings) == 0,
        "findings": findings
    }
@app.post("/compliance/scan")
def compliance_scan(payload: dict):
    return mock_compliance_scan(payload["prompt"])
