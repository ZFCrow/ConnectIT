import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request
import redis
import os

# Flask-Limiter Setup
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "redis://redis:6379")
)

# Rate-limit Logger
ratelimit_logger = logging.getLogger("ratelimit_logger")
ratelimit_logger.setLevel(logging.WARNING)
handler = logging.FileHandler("/var/log/ratelimit.log")
ratelimit_logger.addHandler(handler)

# /register
def get_register_key():
    email = request.form.get("email")
    print("got email")
    return email or get_remote_address()

# /login
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=6379,
    decode_responses=True
)

def is_locked(email: str) -> bool:
    """Check if the user is locked due to failed login attempts."""
    return r.exists(f"lockout:{email}")

def increment_failed_attempts(email: str) -> int:
    """Increase failed attempt count and lock account if needed."""
    key = f"failcount:{email}"
    count = r.incr(key)
    r.expire(key, 3600)  # expire fail count in 1 hour

    if count >= 5:
        r.set(f"lockout:{email}", 1)
        r.expire(f"lockout:{email}", 3600)  # lock account for 1 hour
    return count

def reset_login_attempts(email: str):
    """Clear failure and lockout state on successful login."""
    r.delete(f"failcount:{email}")
    r.delete(f"lockout:{email}")