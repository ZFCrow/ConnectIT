# from pathlib import Path
# from dotenv import load_dotenv , find_dotenv
# # Read host, port, and debug from env, with sensible defaults
# # automatically finds the nearest .env file by walking up
# env_path = find_dotenv(usecwd=True)
# if not env_path:
#     raise RuntimeError("Couldn't locate a .env file")
# load_dotenv(env_path, override=False)

# # then load .env.dev if present, overriding vars
# dev_env = Path(env_path).parent / ".env.dev"
# if dev_env.exists():
#     load_dotenv(dev_env, override=True)

from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from flask_limiter.errors import RateLimitExceeded
import os

from Routes.profile import profile_bp
from Routes.auth import auth_bp
from Routes.job import job_listing_bp
from Routes.label import label_bp
from Routes.violation import violation_bp
from Routes.comment import comment_bp
from Routes.post import post_bp
from Routes.captcha import captcha_bp
from Routes.csrf import csrf_bp
from Routes.multifactorAuth import multi_factor_auth_bp
from Routes.jobApplication import job_application_bp
from Security import Limiter, SplunkUtils

from flask_wtf import CSRFProtect
from flask_wtf.csrf import validate_csrf, CSRFError


# #splunk
SplunkLogging = SplunkUtils.SplunkLogger()


# CORS(app)
def create_app():
    app = Flask(__name__)

    # Initialize extensions
    Limiter.limiter.init_app(app)
    CORS(app)
    SplunkUtils.SplunkLogger()

    app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET")
    CSRFProtect(app)

    # Validate CSRF on all modifying requests (POST, "GET" ,PUT, DELETE)
    @app.before_request
    def verify_csrf_token():
        if request.method in ("GET", "POST", "PUT", "DELETE"):
            # Skip OPTIONS or if you've explicitly exempted routes
            token = request.cookies.get("csrf_token") or request.headers.get(
                "X-CSRFToken"
            )
            if not token:
                abort(400, description="Missing CSRF token")
            try:
                validate_csrf(token)
            except CSRFError as e:
                abort(400, description=f"CSRF validation failed: {e}")

    # Register your blueprints
    app.register_blueprint(profile_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(job_listing_bp)
    app.register_blueprint(job_application_bp)
    app.register_blueprint(label_bp)
    app.register_blueprint(violation_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(post_bp)

    # Register error handlers, routes, etc.
    app.register_blueprint(captcha_bp)
    app.register_blueprint(multi_factor_auth_bp)
    app.register_blueprint(csrf_bp)

    @app.errorhandler(RateLimitExceeded)
    def handle_rate_limit_exceeded(e):
        if request.path == "/register":
            user = ""
        elif request.path == "/addJob":
            company_id = (request.get_json()).get("company_id")
            user = f"companyId={company_id}"
        elif request.path == "/applyJob":
            user_id = request.form.get("userId") or request.get_json().get("userId")
            user = f"userId={user_id}"
        else:
            account_id = (
                request.form.get("accountId")
                or request.args.get("accountId")
                or (request.get_json()).get("accountId")
            )
            user = f"accountId={account_id}"

        SplunkLogging.send_log(
            {
                "event": "Rate Limit Success",
                "function": f"{e.description}@{request.path}",
                "User": user,
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

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

    return app


app = create_app()


@app.route("/")
def index():
    return jsonify({"message": "Welcome to the API!"}, 200)


if __name__ == "__main__":
    # Dev-server entrypoint
    app.run(
        host=os.getenv("FLASK_RUN_HOST", "127.0.0.1"),
        port=int(os.getenv("FLASK_RUN_PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "false").lower() in ("1", "true"),
    )
