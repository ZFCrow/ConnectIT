import pyotp
import qrcode
import io
import base64
import re
from cryptography.fernet import Fernet
import os

fernet = Fernet(os.getenv("FERNET_KEY").encode())


def create_qrcode(email: str):
    # Generate a base32 secret
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)

    # Create OTPAuth URL
    otp_url = totp.provisioning_uri(name=email, issuer_name="ConnectIT")

    # Generate QR code
    img = qrcode.make(otp_url)
    buf = io.BytesIO()
    img.save(buf)
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    encrypted_secret = fernet.encrypt(secret.encode()).decode()

    return {"qr_code": img_b64, "secret": encrypted_secret}


def validate2FA(code: str, encrypted_secret: str):
    if not encrypted_secret:
        return {"verified": False, "error": "No secret provided"}, 400

    if not re.fullmatch(r"\d{6}", code):
        return {"verified": False, "error": "Invalid code format"}, 400

    try:
        secret = fernet.decrypt(encrypted_secret.encode()).decode()
    except Exception:
        return {"verified": False, "error": "Decryption failed"}, 400
    totp = pyotp.TOTP(secret)
    if totp.verify(code):
        return {"verified": True}, 200
    else:
        return {"verified": False}, 401
