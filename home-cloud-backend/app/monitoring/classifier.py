from app.monitoring.schemas import CheckResult, CheckStatus

def classify_failure(result: CheckResult) -> dict:
    """
    Classify a CheckResult into a structured failure intelligence format.
    Types: DNS_FAILURE, TCP_FAILURE, SSL_FAILURE, TIMEOUT, HTTP_4XX, HTTP_5XX, CONTENT_VALIDATION_FAILURE, PERFORMANCE_DEGRADATION
    Severities: Warning, Critical, Recovery
    """
    
    if result.status == CheckStatus.UP:
        return {
            "type": "HEALTHY",
            "severity": "Recovery",
            "explanation": "The service is operating normally.",
            "confidence": 1.0
        }
        
    if result.dns and not result.dns.success:
        return {
            "type": "DNS_FAILURE",
            "severity": "Critical",
            "explanation": f"DNS Resolution failed: {result.dns.error}",
            "confidence": 0.95
        }
        
    if result.tcp and not result.tcp.success:
        return {
            "type": "TCP_FAILURE",
            "severity": "Critical",
            "explanation": f"Network connection refused or timed out: {result.tcp.error}",
            "confidence": 0.90
        }
        
    if result.http:
        if result.http.is_ssl_valid is False:
            return {
                "type": "SSL_FAILURE",
                "severity": "Critical",
                "explanation": result.http.error or "SSL certificate is invalid, expired, or hostname mismatch.",
                "confidence": 0.95
            }
            
        if result.http.ssl_days_remaining is not None and result.http.ssl_days_remaining < 7:
            return {
                "type": "SSL_FAILURE",
                "severity": "Warning",
                "explanation": f"SSL certificate expires in {result.http.ssl_days_remaining} days.",
                "confidence": 0.95
            }

        if not result.http.success:
            if "timed out" in (result.http.error or "").lower():
                return {
                    "type": "TIMEOUT",
                    "severity": "Critical",
                    "explanation": f"HTTP request timed out.",
                    "confidence": 0.90
                }
            elif result.http.status_code and result.http.status_code >= 500:
                return {
                    "type": "HTTP_5XX",
                    "severity": "Critical",
                    "explanation": f"Server returned an error: {result.http.status_code}. Host may be down or crashing.",
                    "confidence": 0.85
                }
            elif result.http.status_code and result.http.status_code >= 400:
                return {
                    "type": "HTTP_4XX",
                    "severity": "Warning",
                    "explanation": f"Application returned an error: {result.http.status_code}. Invalid response structure or authentication error.",
                    "confidence": 0.85
                }
            else:
                return {
                    "type": "HTTP_5XX",
                    "severity": "Critical",
                    "explanation": f"HTTP request failed: {result.http.error}",
                    "confidence": 0.80
                }
        else:
            if result.http.expected_status_matched is False:
                return {
                    "type": "CONTENT_VALIDATION_FAILURE",
                    "severity": "Warning",
                    "explanation": result.http.error or "Server returned an unexpected HTTP status code.",
                    "confidence": 0.95
                }
            if result.http.content_matched is False:
                return {
                    "type": "CONTENT_VALIDATION_FAILURE",
                    "severity": "Warning",
                    "explanation": result.http.error or "The expected keyword was not found in the response body.",
                    "confidence": 0.95
                }
                
    if result.status == CheckStatus.DEGRADED:
        return {
            "type": "PERFORMANCE_DEGRADATION",
            "severity": "Warning",
            "explanation": f"Service is responding slowly or experiencing issues. {result.message}",
            "confidence": 0.90
        }
        
    return {
        "type": "UNKNOWN_FAILURE",
        "severity": "Warning",
        "explanation": f"An unknown issue occurred: {result.message}",
        "confidence": 0.50
    }
