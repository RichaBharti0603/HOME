from fastapi import Request, HTTPException
from loguru import logger
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = {} # {ip: [timestamps]}

    async def check_rate_limit(self, request: Request):
        ip = request.client.host
        now = time.time()
        
        # Clean up old timestamps
        if ip in self.requests:
            self.requests[ip] = [t for t in self.requests[ip] if now - t < 60]
        else:
            self.requests[ip] = []

        if len(self.requests[ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            raise HTTPException(status_code=429, detail="Too many requests")
        
        self.requests[ip].append(now)

rate_limiter = RateLimiter()
