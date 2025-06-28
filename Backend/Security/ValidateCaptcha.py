import os
import requests
from flask import request

def verify_hcaptcha(token: str) -> dict:

    HCAPTCHA_SECRET = os.getenv("HCAPTCHA_SECRET")

    if not HCAPTCHA_SECRET:
        print("ERROR: HCAPTCHA_SECRET environment variable not found.")
        return {
            "success": False,
            "message": "Backend CAPTCHA secret key not configured.",
            "data": None
        }

    payload = {
        "secret": HCAPTCHA_SECRET,
        "response": token,
        # remote use for security checks
        "remoteip": request.remote_addr if request else "unknown"
    }

    try:
        response = requests.post("https://hcaptcha.com/siteverify", data=payload, timeout=(5, 10))  # 5 seconds for connection, 10 seconds for read
        result = response.json()
        if result.get("success"):
            return {
                "success": True,
                "message": "CAPTCHA passed!",
                "data": result
            }
        else:
            error_codes = result.get("error-codes", [])
            return {
                "success": False,
                "message": f"CAPTCHA failed: {', '.join(error_codes)}",
                "data": result
            }
    except requests.exceptions.RequestException as e:
        print(f"Network error during CAPTCHA verification: {e}")
        return {
            "success": False,
            "message": f"Network error during CAPTCHA verification: {str(e)}",
            "data": None
        }
    except Exception as e:
        print(f"Unexpected error during CAPTCHA verification: {e}")
        return {
            "success": False,
            "message": f"An unexpected error occurred during CAPTCHA verification: {str(e)}",
            "data": None
        }