from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask import request
import redis
import os

# Flask-Limiter Setup
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "redis://redis:6379"),
    default_limits=["60 per minute"],
)


# /register
def get_register_key():
    email = request.form.get("email")
    print("got email")
    return email or get_remote_address()


# /login
r = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, decode_responses=True)


def get_failed_attempts_count(email: str) -> int:
    key = f"failcount:{email}"
    count_str = r.get(key)
    if count_str:
        return int(count_str)
    return 0


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


# get account ID
def get_account_key():
    if request.is_json:
        return request.get_json().get("accountId")
    else:
        return request.form.get("accountId")


# get company ID
def get_company_key():
    data = request.get_json(silent=True) or {}
    company_id = data.get("company_id")
    if company_id:
        return company_id


# get user ID
def get_user_key():
    if request.content_type.startswith("multipart/form-data"):
        return request.form.get("userId", type=int)
    else:
        payload = request.get_json(silent=True) or {}
        return payload.get("userId")
