from app.monitoring.schemas import CheckResult, CheckStatus

def classify_failure(result: CheckResult) -> dict:
    """
    Classify a CheckResult into a structured failure intelligence format.
    Types: Network Failure, DNS Failure, Server Unreachable, Application Error, Performance Degradation.
    """
    
    if result.status == CheckStatus.UP:
        return {
            "type": "HEALTHY",
            "severity": "NONE",
            "explanation": "The service is operating normally.",
            "confidence": 1.0
        }
        
    if result.dns and not result.dns.success:
        return {
            "type": "DNS_FAILURE",
            "severity": "CRITICAL",
            "explanation": f"DNS Resolution failed: {result.dns.error}",
            "confidence": 0.95
        }
        
    if result.tcp and not result.tcp.success:
        return {
            "type": "NETWORK_FAILURE",
            "severity": "CRITICAL",
            "explanation": f"Network connection refused or timed out: {result.tcp.error}",
            "confidence": 0.90
        }
        
    if result.http:
        if not result.http.success:
            if result.http.status_code and result.http.status_code >= 500:
                return {
                    "type": "SERVER_UNREACHABLE",
                    "severity": "CRITICAL",
                    "explanation": f"Server returned an error: {result.http.status_code}. Host may be down or crashing.",
                    "confidence": 0.85
                }
            elif result.http.status_code and result.http.status_code >= 400:
                return {
                    "type": "APPLICATION_ERROR",
                    "severity": "HIGH",
                    "explanation": f"Application returned an error: {result.http.status_code}. Invalid response structure or authentication error.",
                    "confidence": 0.85
                }
            else:
                return {
                    "type": "APPLICATION_ERROR",
                    "severity": "HIGH",
                    "explanation": f"HTTP request failed: {result.http.error}",
                    "confidence": 0.80
                }
        else:
            if result.http.expected_status_matched is False:
                return {
                    "type": "UNEXPECTED_STATUS_CODE",
                    "severity": "HIGH",
                    "explanation": result.http.error or "Server returned an unexpected HTTP status code.",
                    "confidence": 0.95
                }
            if result.http.content_matched is False:
                return {
                    "type": "CONTENT_VALIDATION_FAILURE",
                    "severity": "HIGH",
                    "explanation": result.http.error or "The expected keyword was not found in the response body.",
                    "confidence": 0.95
                }
                
    if result.status == CheckStatus.DEGRADED:
        return {
            "type": "PERFORMANCE_DEGRADATION",
            "severity": "MEDIUM",
            "explanation": f"Service is responding slowly or experiencing issues. {result.message}",
            "confidence": 0.90
        }
        
    return {
        "type": "UNKNOWN_FAILURE",
        "severity": "MEDIUM",
        "explanation": f"An unknown issue occurred: {result.message}",
        "confidence": 0.50
    }
