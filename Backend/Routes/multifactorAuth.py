from flask import Blueprint, request, jsonify
from Security import TwoFactorAuth
from Security import SplunkUtils


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
def verify_2fa():
    code = request.json.get("code")
    secret = request.json.get("secret")

    result, status_code = TwoFactorAuth.validate2FA(code, secret)

    if result:

        SplunkLogging.send_log(
            {
                "event": "Login Success",
                "user": "xxx",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
                
        )
    
    else:
        SplunkLogging.send_log(
            {
                "event": "Login Failed",
                "reason": "Failed 2FA validation",
                "ip": request.remote_addr,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
    return jsonify(result), status_code
