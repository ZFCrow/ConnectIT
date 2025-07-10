from flask import Blueprint, request, jsonify
from Security import TwoFactorAuth
from Security import SplunkUtils
from Security.Limiter import limiter, get_account_key

multi_factor_auth_bp = Blueprint("multi_factor_auth", __name__)
SplunkLogging = SplunkUtils.SplunkLogger()


# Route for 2FA Qr-code generation
@multi_factor_auth_bp.route("/2fa-generate", methods=["POST"])
def generate_2fa():
    email = request.json.get("email")
    if not email:
        SplunkLogging.send_log(
            {
                "event": "Generate 2FA Failed",
                "reason": "missing email",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"error": "Missing email"}), 400

    result = TwoFactorAuth.create_qrcode(email)

    return (
        jsonify(result),
        200,
    )


# Route for 2FA code verification
@multi_factor_auth_bp.route("/2fa-verify", methods=["POST"])
@limiter.limit("5 per 10 minutes", key_func=get_account_key)
def verify_2fa():
    code = request.json.get("code")
    secret = request.json.get("secret")
    accountId = request.json.get("accountId")

    result, status_code = TwoFactorAuth.validate2FA(code, secret)

    SplunkLogging.send_log(
        {
            "event": "Login Success" if result.get("verified") else "Login Failed",
            "AccountId": accountId,
            "ip": SplunkLogging.get_real_ip(request),
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path,
        }
    )
    # if result.get("verified"):

    #     SplunkLogging.send_log(
    #         {
    #             "event": "Login Success",
    #             "AccountId": accountId,
    #             "ip": SplunkLogging.get_real_ip(request),
    #             "user_agent": str(request.user_agent),
    #             "method": request.method,
    #             "path": request.path,
    #         }
    #     )
    # else:
    #     SplunkLogging.send_log(
    #         {
    #             "event": "Login Failed",
    #             "reason": "Failed 2FA validation",
    #             "AccountId": accountId,
    #             "ip": SplunkLogging.get_real_ip(request),
    #             "user_agent": str(request.user_agent),
    #             "method": request.method,
    #             "path": request.path,
    #         }
    #     )
    return jsonify(result), status_code
