import requests
import socket
from backend.core.failure_types import FailureType

def classify_failure(response=None, exception=None, response_time_ms=None):
    if response:
        status = response.status_code

        if status == 200:
            if response_time_ms and response_time_ms > 3000:
                return FailureType.PERFORMANCE_DEGRADED
            return FailureType.UP

        if 400 <= status < 500:
            return FailureType.CLIENT_ERROR

        if 500 <= status < 600:
            return FailureType.SERVER_ERROR

    if exception:
        if isinstance(exception, requests.exceptions.Timeout):
            return FailureType.TIMEOUT

        if isinstance(exception, requests.exceptions.ConnectionError):
            return FailureType.NETWORK_FAILURE

        if isinstance(exception, socket.gaierror):
            return FailureType.DNS_FAILURE

    return FailureType.UNKNOWN
