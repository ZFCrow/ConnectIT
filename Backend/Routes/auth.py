from flask import Blueprint, request, jsonify, make_response, abort, redirect
from Control.AccountControl import AccountControl
from SQLModels.AccountModel import Role
from Security.ValidateInputs import validate_register, validate_login
from Security.ValidateFiles import enforce_pdf_limits, sanitize_pdf
from Security.JWTUtils import JWTUtils
from Security import SplunkUtils
from Security.ValidateCaptcha import verify_hcaptcha
import time
from Security.Limiter import (
    limiter,
    get_register_key,
    is_locked,
    increment_failed_attempts,
    get_failed_attempts_count,
    reset_login_attempts,
)
from datetime import datetime
import jwt

auth_bp = Blueprint("auth", __name__)

# splunk
SplunkLogging = SplunkUtils.SplunkLogger()


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute", key_func=get_register_key)
def register():
    payload = request.form.to_dict()
    errors = validate_register(payload)

    if errors:

        SplunkLogging.send_log(
            {
                "event": "Register attempt failed",
                "reason": "Validation Errors",
                "errors": errors,
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": errors}), 400

    if payload["role"] == Role.Company.value:
        companyDoc = request.files.get("companyDoc", None)
        if not companyDoc:

            SplunkLogging.send_log(
                {
                    "event": "Register Attempt Failed",
                    "reason": "Verification Errors",
                    "errors": "Verification document required",
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )

            return jsonify({"error": "Verification document required"}), 500

        try:
            enforce_pdf_limits(companyDoc)
            companyDoc = sanitize_pdf(companyDoc)
        except ValueError as ve:

            SplunkLogging.send_log(
                {
                    "event": "Register Attempt Failed",
                    "reason": "Invalid PDF upload",
                    "error": str(ve),
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )

            return jsonify({"error": str(ve)}), 400

        payload["companyDoc"] = companyDoc

    success = AccountControl.createAccount(payload)

    if success:

        SplunkLogging.send_log(
            {
                "event": "Registration Successful",
                "email": payload.get("email"),
                "role": payload.get("role"),
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        print("SUCCESS REGISTER")

        return jsonify({"message": "Account created successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Registration Failed",
                "reason": "Internal server error",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to create account"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    start_time = time.time()  # Start timer
    payload = request.get_json() or {}
    email = payload.get("email")
    captcha_token = payload.get("captchaToken")

    if is_locked(email):
        SplunkLogging.send_log(
            {
                "event": "Login Failed",
                "reason": "Account locked due to rate limit",
                "email": email,
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Account locked due to too many failed attempts"}), 403

    current_failed_attempts = get_failed_attempts_count(email)
    CAPTCHA_THRESHOLD = 3

    if current_failed_attempts >= CAPTCHA_THRESHOLD:
        if not captcha_token:
            # If CAPTCHA is required but not provided,
            # signal frontend to show it
            SplunkLogging.send_log(
                {
                    "event": "Login Attempt Failed",
                    "reason": "CAPTCHA required but token missing",
                    "email": email,
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )
            # Return a response that tells the frontend to display the CAPTCHA
            return (
                jsonify(
                    {
                        "message": "Please complete the Captcha \
                 below",
                        "showCaptcha": True,
                    }
                ),
                400,
            )

        # If CAPTCHA token is provided, verify it
        captcha_result = verify_hcaptcha(captcha_token)
        if not captcha_result["success"]:
            # If CAPTCHA verification fails,
            # increment failed attempts and return error
            # Failed CAPTCHA counts as a failed attempt
            increment_failed_attempts(email)
            SplunkLogging.send_log(
                {
                    "event": "Login Attempt Failed",
                    "reason": "HCaptcha verification failed",
                    "hcaptcha_errors": captcha_result.get("data", {}).get(
                        "error-codes"
                    ),
                    "email": email,
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )
            # Also tell frontend to show CAPTCHA again if verification failed
            return (
                jsonify({"error": "CAPTCHA verification failed.", "showCaptcha": True}),
                400,
            )

    errors = validate_login(payload)
    if errors:

        SplunkLogging.send_log(
            {
                "event": "Login Attempt Failed",
                "reason": "Validation Errors",
                "errors": errors,
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": errors}), 400

    account = AccountControl.authenticateAccount(payload)
    duration_ms = round((time.time() - start_time) * 1000, 2)  # Duration in ms

    if not account:
        count = increment_failed_attempts(email)

        if count > 5:
            SplunkLogging.send_log(
                {
                    "event": "Login Failed",
                    "email": payload.get("email"),
                    "reason": "Account locked",
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "duration_ms": round((time.time() - start_time) * 1000, 2),
                }
            )

            return (
                jsonify(
                    {
                        "error": "Account locked due to \
                         too many failed attempts"
                    }
                ),
                403,
            )

        SplunkLogging.send_log(
            {
                "event": "Login Failed",
                "reason": "Invalid credentials",
                "email": email,
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "duration_ms": duration_ms,
            }
        )

        return jsonify({"message": "Incorrect credentials"}), 401

    if account:
        reset_login_attempts(email)
        base_data = {
            "accountId": account.accountId,
            "name": account.name,
            "email": account.email,
            "passwordHash": account.passwordHash,
            "role": account.role,
            "isDisabled": account.isDisabled,
            "profilePicUrl": account.profilePicUrl,
            "twoFaEnabled": account.twoFaEnabled,
            "twoFaSecret": account.twoFaSecret,
        }

        optional_keys = [
            "bio",
            "portfolioUrl",
            "description",
            "location",
            "verified",
            "companyId",
            "userId",
            "companyDocUrl",
        ]
        optional_data = {
            key: getattr(account, key) for key in optional_keys if hasattr(account, key)
        }

        merged = {**base_data, **optional_data}

        return jsonify(merged), 200


@auth_bp.route("/create_token", methods=["POST"])
def create_token():
    data = request.get_json() or {}
    account_id = data.get("accountId")
    user_role = data.get("role")
    name = data.get("name")
    profile_pic_url = data.get("profilePicUrl")
    user_id = data.get("userId")
    company_id = data.get("companyId")
    is_verified = data.get("verified")

    if not account_id or not user_role or not name:

        SplunkLogging.send_log(
            {
                "event": "Token Creation Failed",
                "reason": "Missing token creation data",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Missing token creation data"}), 400

    token = JWTUtils.generate_jwt_token(
        account_id,
        user_role,
        name,
        profile_pic_url,
        user_id,
        company_id,
        is_verified=is_verified,
    )
    if not token:

        SplunkLogging.send_log(
            {
                "event": "Token Creation Failed",
                "reason": "Token generation failed",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Token generation failed"}), 500

    resp = make_response(jsonify({"message": "Token created"}), 200)
    resp = JWTUtils.set_auth_cookie(resp, token)

    SplunkLogging.send_log(
        {
            "event": "Token Created Successfully",
            "accountId": account_id,
            "role": user_role,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path,
        }
    )

    return resp


@auth_bp.route("/save2fa", methods=["POST"])
def save2fa():
    payload = request.get_json()
    if payload["accountId"] is None:

        SplunkLogging.send_log(
            {
                "event": "Save 2FA Failed",
                "reason": "No account ID provided",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "No account Id"}), 401

    success = AccountControl.setTwoFa(payload["accountId"], payload)

    if success:

        SplunkLogging.send_log(
            {
                "event": "2FA Updated Successfully",
                "accountId": payload["accountId"],
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "2fa updated successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Save 2FA Failed",
                "reason": "Database update failed",
                "accountId": payload["accountId"],
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to update 2fa"}), 500


@auth_bp.route("/me", methods=["GET"])
def me():

    token = JWTUtils.get_token_from_cookie()

    if not token:
        return jsonify({}), 200

    try:
        data = JWTUtils.decode_jwt_token(token)
    except jwt.ExpiredSignatureError:
        return jsonify({}), 200
    except jwt.PyJWTError:
        return jsonify({}), 200

    return (
        jsonify(
            {
                "accountId": data.get("sub"),
                "role": data.get("role"),
                "name": data.get("name"),
                "profilePicUrl": data.get("profilePicUrl"),
                "userId": data.get("userId"),
                "companyId": data.get("companyId"),
                "verified": data.get("verified"),
            }
        ),
        200,
    )


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401)

    try:
        data = JWTUtils.decode_jwt_token(token)
    except jwt.PyJWTError:
        abort(401)

    new_token = JWTUtils.generate_jwt_token(
        account_id=data["sub"],
        user_role=data["role"],
        name=data["name"],
        profile_pic_url=data.get("profilePicUrl"),
        user_id=data.get("userId"),
        company_id=data.get("companyId"),
        is_verified=data.get("verified"),
        orig_iat=datetime.fromisoformat(data["origIat"]),
    )
    resp = make_response(jsonify({}), 200)
    JWTUtils.set_auth_cookie(resp, new_token)
    return resp


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Attempt to pull email/ID from the cookie for your audit log
    raw = JWTUtils.get_token_from_cookie()
    user_id = None
    try:
        claims = JWTUtils.decode_jwt_token(raw)
        user_id = claims.get("sub")
    except (AttributeError, KeyError) as e:
        auth_bp.logger.warning(f"Could not extract user email from claims: {e}")
        user_id = None

    SplunkLogging.send_log(
        {
            "event": "Logout Success",
            "user_id": user_id,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path,
        }
    )

    dest = "/login"
    resp = JWTUtils.remove_auth_cookie(resp)
    resp = make_response(redirect(dest, code=302))
    return resp