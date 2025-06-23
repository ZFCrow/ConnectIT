from flask import Blueprint, request, jsonify, make_response, abort
from Boundary.AccountBoundary import AccountBoundary
from SQLModels.AccountModel import Role
from Security.ValidateInputs import validate_register, validate_login
from Security.JWTUtils import JWTUtils
from Security.Limiter import (
    limiter,
    get_register_key,
    is_locked,
    increment_failed_attempts,
    reset_login_attempts,
    ratelimit_logger,
)
import jwt, pyotp
from datetime import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute", key_func=get_register_key)
def register():
    payload = request.form.to_dict()
    errors = validate_register(payload)

    if errors:
        return jsonify({"error": errors}), 400

    if payload["role"] == Role.Company.value:
        companyDoc = request.files.get("companyDoc", None)
        if not companyDoc:
            return jsonify({"error": "Verification document required"}), 500

        payload["companyDoc"] = companyDoc

    success = AccountBoundary.registerAccount(payload)

    if success:
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create account"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = payload.get("email")

    if is_locked(email):
        ratelimit_logger.warning(
            f"RATE_LIMIT | ip={request.remote_addr} | route=/login | method=POST | limit=lockout after 5 failed logins | email={email}"
        )
        return jsonify({"error": "Account locked due to too many failed attempts"}), 403

    errors = validate_login(payload)
    if errors:
        return jsonify({"error": errors}), 400

    account = AccountBoundary.loginAccount(payload)
    if not account:
        count = increment_failed_attempts(email)
        if count >= 5:
            ratelimit_logger.warning(
                f"RATE_LIMIT | ip={request.remote_addr} | route=/login | method=POST | limit=lockout after 5 failed logins | email={email}"
            )
            return (
                jsonify({"error": "Account locked due to too many failed attempts"}),
                403,
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

        if account.twoFaEnabled:
            otp = payload.get("otp")
            if not otp:
                # tell the client “OTP required” (no cookie yet) with a 200 status
                return jsonify({
                    "twoFaRequired": True,
                    **merged
                }), 200

            totp = pyotp.TOTP(account.twoFaSecret)
            if not totp.verify(otp):
                # bad code → still a 401
                return jsonify({"error": "Invalid two-factor code"}), 401

        return jsonify(merged), 200
    
@auth_bp.route("/create_token", methods=["POST"])
def create_token():
    data = request.get_json() or {}
    account_id      = data.get("accountId")
    user_role       = data.get("role")
    name            = data.get("name")
    profile_pic_url = data.get("profilePicUrl")
    user_id         = data.get("userId")
    company_id      = data.get("companyId")

    if not account_id or not user_role or not name:
        return jsonify({"error": "Missing token creation data"}), 400

    token = JWTUtils.generate_jwt_token(
        account_id,
        user_role,
        name,
        profile_pic_url,
        user_id,
        company_id,
    )
    if not token:
        return jsonify({"error": "Token generation failed"}), 500

    resp = make_response(jsonify({"message": "Token created"}), 200)
    resp = JWTUtils.set_auth_cookie(resp, token)
    return resp

@auth_bp.route("/save2fa", methods=["POST"])
def save2fa():
    payload = request.get_json()
    if payload["accountId"] is None:
        return jsonify({"error": "No account Id"}), 401

    success = AccountBoundary.saveTwoFa(payload["accountId"], payload)

    if success:
        return jsonify({"message": "2fa updated successfully!"}), 201
    else:
        return jsonify({"error": "Failed to update 2fa"}), 500
    
@auth_bp.route('/me', methods=['GET'])
def me():

    token = JWTUtils.get_token_from_cookie()
    print(f"[Auth][me] Raw cookie token: {token}", flush=True)

    if not token:
        print("[Auth][me] No JWT cookie found – returning empty payload", flush=True)
        return jsonify({}), 200

    try:
        data = JWTUtils.decode_jwt_token(token)
    except jwt.ExpiredSignatureError as e:
        print(f"[Auth][me] Token expired: {e}", flush=True)
        return jsonify({}), 200
    except jwt.PyJWTError as e:
        print(f"[Auth][me] JWT decode error: {e}", flush=True)
        return jsonify({}), 200

    print(f"[Auth][me] Decoded claims: {data}", flush=True)

    return jsonify({
        "accountId":     data.get("sub"),
        "role":          data.get("role"),
        "name":          data.get("name"),
        "profilePicUrl": data.get("profilePicUrl"),
        "userId":        data.get("userId"),
        "companyId":     data.get("companyId"),
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401)

    try:
        data = JWTUtils.decode_jwt_token(token)
    except jwt.PyJWTError:
        abort(401)

    # Issue a new token with same origIat
    new_token = JWTUtils.generate_jwt_token(
        account_id     = data["sub"],
        user_role      = data["role"],
        name           = data["name"],
        profile_pic_url= data.get("profilePicUrl"),
        user_id        = data.get("userId"),
        company_id     = data.get("companyId"),
        orig_iat       = datetime.fromisoformat(data["origIat"])
    )
    resp = make_response(jsonify({}), 200)
    JWTUtils.set_auth_cookie(resp, new_token)
    return resp


@auth_bp.route('/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({"message": "Logged out"}), 200)
    return JWTUtils.remove_auth_cookie(resp)
