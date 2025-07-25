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

from flask import Flask, jsonify, request, abort, make_response
from flask_cors import CORS
from flask_limiter.errors import RateLimitExceeded
import os
import jwt

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
from Security.JWTUtils import JWTUtils
from Utils.CsrfUtils import CsrfUtils

from Control.AccountControl import AccountControl


import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler()],
)

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
    app.config.update(
        {
            "SESSION_COOKIE_HTTPONLY": True,
            "SESSION_COOKIE_SECURE": True,
            "SESSION_COOKIE_SAMESITE": "Strict",
        }
    )

    # CSRFProtect(app)

    @app.before_request
    def enforce_single_session():
        # Skip token creation & public routes
        if request.endpoint in (
            "auth.create_token",
            "auth.login",
            "csrf.get_csrf_token",
            None,
        ):
            return

        token = request.cookies.get("session_token")
        if not token:
            return

        # Helper to clear cookie + abort
        def _invalid_session(message):
            resp = make_response(jsonify({"error": message}), 401)
            resp = JWTUtils.remove_auth_cookie(resp)
            # Clear CSRF tokens on session invalidation
            resp.set_cookie(
                "csrf_token_secure",
                "",
                expires=0,
                path="/",
                httponly=True,
                secure=True,
                samesite="Strict",
            )
            resp.set_cookie(
                "csrf_token", "", expires=0, path="/", secure=True, samesite="Strict"
            )
            return resp

        # Decode and validate token
        try:
            payload = JWTUtils.decode_jwt_token(token)
        except jwt.PyJWTError:
            return _invalid_session("Invalid or expired token")

        account_id = payload.get("sub")
        jti = payload.get("jti")

        account = AccountControl.getAccountById(account_id)
        if jti != account.sessionId:
            return _invalid_session("Session invalidated; please log in again")

    # Validate CSRF on all modifying requests (POST, "GET" ,PUT, DELETE)
    @app.before_request
    def verify_csrf_token():
        if request.method in ("GET", "POST", "PUT", "DELETE"):
            # Skip CSRF for authentication routes and CSRF token endpoint
            if request.endpoint in (
                "csrf.get_csrf_token",
                "auth.login",
                "auth.register",
                "auth.create_token",
                None,
            ):
                return

            token = request.cookies.get("session_token")
            if not token:
                return

            # Helper to clear cookie + abort
            def _invalid_session(message):
                resp = make_response(jsonify({"error": message}), 401)
                resp = JWTUtils.remove_auth_cookie(resp)
                # Clear CSRF tokens on session invalidation
                resp.set_cookie("csrf_token_secure", "", expires=0, path="/")
                resp.set_cookie("csrf_token", "", expires=0, path="/")
                return resp

            # Decode and validate token
            try:
                payload = JWTUtils.decode_jwt_token(token)
            except jwt.PyJWTError:
                return _invalid_session("Invalid or expired token")

            account_id = payload.get("sub")
            jti = payload.get("jti")

            account = AccountControl.getAccountById(account_id)
            if jti != account.sessionId:
                return _invalid_session("Session invalidated; please log in again")

            # Only check CSRF if user has a session token (is authenticated)
            session_token = request.cookies.get("session_token")
            if not session_token:
                return  # No session = no CSRF check needed

            # Get CSRF token from header or JS-readable cookie
            header_token = request.headers.get("X-CSRFToken")
            js_cookie_token = request.cookies.get("csrf_token")

            # Get CSRF token from HttpOnly cookie
            secure_cookie_token = request.cookies.get("csrf_token_secure")

            # Prefer header, then JS cookie
            client_token = header_token or js_cookie_token

            if not client_token:
                abort(400, "Missing CSRF token")

            if not secure_cookie_token:
                abort(400, "Missing secure CSRF token")

            # Use custom CSRF validation with token pair
            if not CsrfUtils.validate_csrf_token_pair(
                secure_cookie_token, client_token, session_token
            ):
                abort(400, "CSRF validation failed")

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
            account_id = ""
        elif request.path == "/addJob":
            account_id = request.get_json().get("company_id", "")
        elif request.path == "/applyJob":
            account_id = (
                request.form.get("userId")
                or request.get_json().get("userId")
                or ""
            )
        else:
            account_id = (
                request.form.get("accountId")
                or request.args.get("accountId")
                or (request.get_json()).get("accountId")
            )

        SplunkLogging.send_log(
            {
                "event": "Rate Limit Success",
                "function": f"{e.description}@{request.path}",
                "UserID": account_id,
                "ip": SplunkLogging.get_real_ip(request),
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
