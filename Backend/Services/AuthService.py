from Security import AuthUtils
from Security.ValidateInputs import validate_login
from Security.ValidateCaptcha import verify_hcaptcha
from Security import SplunkUtils
from Security.Limiter import (
    get_failed_attempts_count,
    increment_failed_attempts,
    is_locked,
    reset_login_attempts,
)
from flask import request

SplunkLogging = SplunkUtils.SplunkLogger()
CAPTCHA_THRESHOLD = 3
MAX_FAILED_LOGIN = 5


class AuthService:
    @staticmethod
    def _log(event: str, **fields):
        """
        Centralised wrapper so every Splunk entry has identical boilerplate.

        Usage:
        AuthService._log("Login Failed",
                         reason="Account locked",
                         email=email)
        """
        meta = {
            "ip": SplunkLogging.get_real_ip(request),
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path,
        }
        SplunkLogging.send_log({"event": event, **fields, **meta})

    @staticmethod
    def checkIsLocked(email: str):
        if is_locked(email):
            AuthService._log(
                "Login Failed",
                reason="Account locked due to rate limit",
                email=email,
            )
            return True, "Account locked due to too many failed attempts"

        return False, None

    @staticmethod
    def handleCaptchaForLogin(email: str, captcha_token: str):
        current_failed_attempts = get_failed_attempts_count(email)

        if current_failed_attempts >= CAPTCHA_THRESHOLD:
            if not captcha_token:
                # If CAPTCHA is required but not provided,
                # signal frontend to show it
                AuthService._log(
                    "Login Attempt Failed",
                    reason="CAPTCHA required but token missing",
                    email=email,
                )
                # Return a response that tells the frontend to display the CAPTCHA
                return "Please complete the Captcha below"

            # If CAPTCHA token is provided, verify it
            captcha_result = verify_hcaptcha(captcha_token)
            if not captcha_result["success"]:
                increment_failed_attempts(email)
                AuthService._log(
                    "Login Attempt Failed",
                    reason="HCaptcha verification failed",
                    email=email,
                    hcaptcha_errors=captcha_result.get("data", {}).get("error-codes"),
                )
                # Also tell frontend to show CAPTCHA again if verification failed
                return "CAPTCHA verification failed."

    @staticmethod
    def validateLogin(payload: dict):
        errors = validate_login(payload)
        if errors:

            AuthService._log(
                "Login Attempt Failed",
                reason="Validation Errors",
                errors=errors,
            )

            return errors

    @staticmethod
    def incrementFailedAttempts(email: str, duration_ms: float):
        count = increment_failed_attempts(email)

        if count > MAX_FAILED_LOGIN:
            AuthService._log(
                "Login Failed",
                reason="Account locked",
                email=email,
                duration_ms=duration_ms,
            )

            return "Account locked due to too many failed attempts", 403
        AuthService._log(
            "Login Failed",
            reason="Invalid credentials",
            email=email,
            duration_ms=duration_ms,
        )
        return "Incorrect credentials", 401

    @staticmethod
    def verify_hash_password(password: str, hashPassword: str):
        """
        Verify if the provided password matches the stored hash.
        """
        return AuthUtils.verify_hash_password(password, hashPassword)

    @staticmethod
    def resetLoginAttempts(email: str):
        reset_login_attempts(email)
