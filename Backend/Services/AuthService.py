from Security.Limiter import (
    limiter,
    get_register_key,
    is_locked,
    increment_failed_attempts,
    get_failed_attempts_count,
    reset_login_attempts,
    ratelimit_logger,
)
from Security import SplunkUtils
from Security.ValidateCaptcha import verify_hcaptcha
from datetime import datetime, timezone 
import pyotp 


class AuthService:
    """
    Service for handling authentication-related operations.
    """
    def __init__(self): 
        self.sl = SplunkUtils.SplunkLogger() 

    
    def check_account_locked(self, metaData, email):
        """
        Check if the account is locked.
        """
        
        if is_locked(email):
            timestamp = datetime.now(timezone.utc).isoformat() 
            ratelimit_logger.warning(
                f"RATE_LIMIT | time={timestamp} | ip={metaData['remote_addr']} | "
                f"route={metaData['path']} | method={metaData['request']} | "
                f"limit=lockout after 5 failed logins | email={email}"
            )
            self.sl.send_log(
                {
                    "event": "Rate Limit Exceeded",
                    "reason": "check_account_locked",
                    "email": email,
                    "ip": metaData["remote_addr"] ,
                    "user_agent": metaData["user_agent"], 
                    "method": metaData["method"], 
                    "path": metaData["path"], 
                }
            )
            return True
    def sendLog(self, event_data): 
        """
        Sends a log to Splunk.
        """
        self.sl.send_log(event_data) 

    def login(self, 
              account,
              email,
              metaData) -> dict[str, any]: 
        if not account:
            count = increment_failed_attempts(email) 
            if count > 5 : 
                timestamp = datetime.now(timezone.utc).isoformat() 
                ratelimit_logger.warning (
                    f"RATE_LIMIT | time={timestamp} | ip={metaData['remote_addr']} | "
                    f"route={metaData['path']} | method={metaData['method']} | "
                    f"limit=lockout after 5 failed logins | email={email}" 
                )

                self.sl.send_log( 
                    {
                    "event": "Login Failed",
                    "email": metaData["email"], 
                    "reason": "Accout Locked", 
                    "ip": metaData["remote_addr"],
                    "user_agent": metaData["user_agent"], 
                    }
                )
                return {
                    "error": "Account is locked due to too many failed login attempts.",
                    "status": 403,
                    "account": None, 
                } 
            else: 
                self.sl.send_log(
                    {
                        "event": "Login Attempt Failed",
                        "reason": "Invalid Credentials",
                        "email": email,
                        "ip": metaData["remote_addr"],
                        "user_agent": metaData["user_agent"],
                        "method": metaData["method"],
                        "path": metaData["path"],
                    }
                )
                return {
                    "error": "Invalid credentials.",
                    "status": 401,
                    "account": None,
                } 
        else: 
            # got account 
            reset_login_attempts(email) 
            baseData = {
                "accountId": account.accountId, 
                "name": account.name, 
                "email": account.email, 
                "passwordHash": account.passwordHash, 
                "role": account.role,  
                "isDiabled": account.isDisabled, 
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
                key: getattr(account, key, None) for key in optional_keys 
            }

            merged = {**baseData, **optional_data} 

            if account.twoFaEnabled: 
                otp = metaData.get("otp", None) 
                if not otp:
                    self.sl.send_log(
                        {
                            "event": "Two-Factor Authentication Required",
                            "reason": "login",
                            "email": email,
                            "ip": metaData["remote_addr"],
                            "user_agent": metaData["user_agent"],
                            "method": metaData["method"],
                            "path": metaData["path"],
                        }
                    )
                    return {
                        "error": "Two-Factor Authentication required.",
                        "status": 403,
                        "account": None,
                        "two_fa_required": True,
                    } 
                else:
                    # verify the OTP
                    totp = pyotp.TOTP(account.twoFaSecret) 
                    if not totp.verify(otp):
                        self.sl.send_log(
                            {
                                "event": "Two-Factor Authentication Failed",
                                "reason": "Invalid OTP",
                                "email": email,
                                "ip": metaData["remote_addr"],
                                "user_agent": metaData["user_agent"],
                                "method": metaData["method"],
                                "path": metaData["path"],
                            }
                        )
                        return {
                            "error": "Invalid OTP.",
                            "status": 403,
                            "account": None,
                            "two_fa_required": True,
                        } 
                    else: 
                        self.sl.send_log(
                            {
                                "event": "Two-Factor Authentication Success",
                                "email": email,
                                "ip": metaData["remote_addr"],
                                "user_agent": metaData["user_agent"],
                                "method": metaData["method"],
                                "path": metaData["path"],
                            }
                        )
                        return {
                            "error": None,
                            "status": 200,
                            "account": merged,
                            "two_fa_required": False,
                        } 
                    
    def verifyCaptcha(self, email, captchaToken, metaData) -> dict[str, any]:
        """
        Checks if fail attempts > 3; if so, performs captcha verification.
        Otherwise, returns with no error.
        """
        currentFailCount = get_failed_attempts_count(email)

        if currentFailCount >= 3:
            if not captchaToken:
                self.sl.send_log(
                    {
                        "event": "Captcha Required",
                        "reason": "verifyCaptcha",
                        "email": email,
                        "ip": metaData["remote_addr"],
                        "user_agent": metaData["user_agent"],
                        "method": metaData["method"],
                        "path": metaData["path"],
                    }
                )
                return {
                    "error": "Captcha verification required.",
                    "status": 400,
                    "captcha_required": True,
                }

            result = verify_hcaptcha(captchaToken)
            if not result["success"]:
                self.sl.send_log(
                    {
                        "event": "Login Attempt Failed",
                        "reason": "HCaptcha verification failed",
                        "hcaptcha_errors": result.get("data", {}).get("error-codes"),
                        "email": email,
                        "ip": metaData["remote_addr"],
                        "user_agent": metaData["user_agent"],
                        "method": metaData["method"],
                        "path": metaData["path"],
                    }
                )
                return {
                    "error": "Captcha verification failed.",
                    "status": 400,
                    "showCaptcha": True,
                }

            return {
                "error": None,
                "status": 200,
                "showCaptcha": False,
            }

        return {
            "error": None,
            "status": 200,
            "captcha_required": False,
        }
            
            
