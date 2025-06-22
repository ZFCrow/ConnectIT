import pyotp
import qrcode
import io
import base64

def create_qrcode(email: str):
    # Generate a base32 secret
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)

    # Need to change to store in DB

    # Create OTPAuth URL
    otp_url = totp.provisioning_uri(name=email, issuer_name="ConnectIT")

    # Generate QR code
    img = qrcode.make(otp_url)
    buf = io.BytesIO()
    img.save(buf)
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {"qr_code": img_b64, "secret": secret}


def validate2FA(code: str, secret: str):
    if not secret:
        return {"verified": False, "error": "No secret provided"}, 400

    totp = pyotp.TOTP(secret)
    if totp.verify(code):
        return {"verified": True}, 200
    else:
        return {"verified": False}, 401
