from flask import Blueprint, request, jsonify
from flask_limiter.errors import RateLimitExceeded
from datetime import datetime, timezone
from Security import Limiter 

error_handling_bp = Blueprint("error_handling", __name__) 

@error_handling_bp.errorhandler(RateLimitExceeded)
def handle_rate_limit_exceeded(e):
    if request.path == "/register":
        user = ""
    elif request.path == "/addJob":
        company_id = (request.get_json()).get("company_id")
        user = f" | companyId={company_id}"
    elif request.path == "/applyJob":
        user_id = request.form.get("userId") or request.get_json().get("userId")
        user = f" | userId={user_id}"
    else:
        account_id = (
            request.form.get("accountId")
            or request.args.get("accountId")
            or (request.get_json()).get("accountId")
        )
        user = f" | accountId={account_id}"

    timestamp = datetime.now(timezone.utc).isoformat()

    message = (
        f"RATE_LIMIT | time={timestamp} | ip={request.remote_addr} | "
        f"route={request.path} | method={request.method} | "
        f"limit={e.description}{user}"
    )
    Limiter.ratelimit_logger.warning(message)

    return (
        jsonify(
            {
                "error": "Rate limit exceeded",
                "message": str(e.description),
                "status": 429,
            }
        ),
        429,
    )