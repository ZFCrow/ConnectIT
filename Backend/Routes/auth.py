from flask import Blueprint, request, jsonify, make_response, abort
from Control.AccountControl import AccountControl
from SQLModels.AccountModel import Role
from Security.ValidateInputs import validate_register
from Security.ValidateFiles import enforce_pdf_limits, sanitize_pdf
from Security.JWTUtils import JWTUtils
from Security import SplunkUtils
from Security.Limiter import (
    limiter,
    get_register_key,
)
from datetime import datetime
import jwt
import uuid

auth_bp = Blueprint("auth", __name__)

# splunk
SplunkLogging = SplunkUtils.SplunkLogger()


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute", key_func=get_register_key)
def register():
    payload = request.form.to_dict()
    errors = validate_register(payload)

    if payload["role"] not in ["User", "Company"]:
        return jsonify({"error": "Failed to create account"}), 500

    if errors:

        SplunkLogging.send_log(
            {
                "event": "Register attempt failed",
                "reason": "Validation Errors",
                "errors": errors,
                "ip": SplunkLogging.get_real_ip(request),
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
                    "ip": SplunkLogging.get_real_ip(request),
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
                    "ip": SplunkLogging.get_real_ip(request),
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )

            return jsonify({"error": str(ve)}), 400

        payload["companyDoc"] = companyDoc

    success, errorMsg = AccountControl.createAccount(payload)

    if success:

        SplunkLogging.send_log(
            {
                "event": "Registration Success",
                "email": payload.get("email"),
                "role": payload.get("role"),
                "ip": SplunkLogging.get_real_ip(request),
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
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        if (errorMsg):
            return jsonify({"error": errorMsg}), 500
        return jsonify({"error": "Failed to create account"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json() or {}

    return AccountControl.authenticateAccount(payload)


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
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Missing token creation data"}), 400
    new_jti = str(uuid.uuid4())
    token = JWTUtils.generate_jwt_token(
        account_id,
        user_role,
        name,
        profile_pic_url,
        user_id,
        company_id,
        is_verified=is_verified,
        jti=new_jti
    )
    if not token:

        SplunkLogging.send_log(
            {
                "event": "Token Creation Failed",
                "reason": "Token generation failed",
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Token generation failed"}), 500
    success = AccountControl.setSessionId(account_id, {"sessionId": new_jti})
    if not success:
        return jsonify({"error": "Could not bind session"}), 500
    resp = make_response(jsonify({"message": "Token created"}), 200)
    resp = JWTUtils.set_auth_cookie(resp, token)

    SplunkLogging.send_log(
        {
            "event": "Token Created Success",
            "accountId": account_id,
            "role": user_role,
            "ip": SplunkLogging.get_real_ip(request),
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
                "ip": SplunkLogging.get_real_ip(request),
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
                "ip": SplunkLogging.get_real_ip(request),
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
                "ip": SplunkLogging.get_real_ip(request),
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


@auth_bp.route("/setSession", methods=["POST"])
def setSession():
    payload = request.get_json()
    if payload["accountId"] is None:
        return jsonify({"error": "No account Id"}), 401

    success = AccountControl.setSessionId(payload["accountId"], payload)

    if success:
        return jsonify({"message": "Session id updated successfully!"}), 201

    else:
        return jsonify({"error": "Failed to update session id"}), 500


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
            "AccountId": user_id,
            "ip": SplunkLogging.get_real_ip(request),
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path,
        }
    )

    resp = make_response(jsonify({"message": "Logged out"}), 200)
    return JWTUtils.remove_auth_cookie(resp)
