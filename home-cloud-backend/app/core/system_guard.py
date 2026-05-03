import logging
import redis
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class RedisHealthGuard:
    is_available = False

    @classmethod
    def ping_and_verify(cls):
        try:
            r = redis.Redis.from_url(settings.celery_broker_url, socket_connect_timeout=3)
            if r.ping():
                cls.is_available = True
                logger.info(f"RedisHealthGuard: Connected to {settings.celery_broker_url}")
            else:
                logger.warning("RedisHealthGuard: Ping returned False")
        except Exception as e:
            cls.is_available = False
            logger.error(f"RedisHealthGuard: Connection failed - {e}")
            logger.error("WARNING: Running without Redis. Celery tasks will fallback or queue indefinitely.")
