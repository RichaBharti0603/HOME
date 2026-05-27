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
            redis_url = settings.redis_url or settings.celery_broker_url
            r = redis.Redis.from_url(
                redis_url,
                socket_connect_timeout=1,
                socket_timeout=1,
                retry_on_timeout=False,
            )
            if r.ping():
                cls.is_available = True
                logger.info("RedisHealthGuard: Connected")
            else:
                cls.is_available = False
                logger.warning("RedisHealthGuard: Ping returned False")
        except Exception as e:
            cls.is_available = False
            logger.error(f"RedisHealthGuard: Connection failed - {e}")
            logger.error("WARNING: Running without Redis. Celery tasks will fallback or queue indefinitely.")
