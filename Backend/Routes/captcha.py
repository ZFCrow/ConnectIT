from flask import Blueprint, request, jsonify
from Security import ValidateCaptcha


captcha_bp = Blueprint("captcha", __name__)


# Route for HCaptcha token verification
@captcha_bp.route("/verify-captcha", methods=["POST"])
def verify_captcha_endpoint():
    print("Received request at /verify-captcha endpoint.")
    data = request.get_json()
    token = data.get("token")

    if not token:
        return jsonify({"success": False, "message": "Missing CAPTCHA token"}), 400

    result = ValidateCaptcha.verify_hcaptcha(token)
    print(f"Token received: {token}")

    return jsonify(result), 200 if result["success"] else 400
