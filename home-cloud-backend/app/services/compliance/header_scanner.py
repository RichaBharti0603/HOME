def scan_security_headers(headers: dict):

    required_headers = [
        "Strict-Transport-Security",
        "Content-Security-Policy",
        "X-Frame-Options",
        "X-Content-Type-Options"
    ]

    score = 0
    results = {}

    for header in required_headers:
        if header in headers:
            results[header] = True
            score += 25
        else:
            results[header] = False

    return {
        "score": score,
        "details": results
    }
