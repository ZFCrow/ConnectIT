import jwt
import os
from datetime import datetime, timedelta, timezone
from flask import request
import uuid


class JWTUtils:
    SECRET_KEY = os.getenv("JWT_SECRET")
    ALGORITHM = "HS512"
    EXPIRATION = timedelta(hours=24)

    @staticmethod
    def generate_jwt_token(
        account_id: int,
        user_role: str,
        name: str,
        profile_pic_url: str | None = None,
        user_id: int | None = None,
        company_id: int | None = None,
        is_verified: bool | None = None,
        orig_iat: datetime | None = None,
        jti: str | None = None,
    ) -> str:
        now = datetime.now(timezone.utc)
        if orig_iat is None:
            orig_iat = now

        if jti is None:
            jti = str(uuid.uuid4())

        payload = {
            "sub": str(account_id),
            "role": user_role,
            "name": name,
            "profilePicUrl": profile_pic_url,
            "userId": str(user_id) if user_id is not None else None,
            "companyId": str(company_id) if company_id is not None else None,
            "verified": is_verified,
            "iat": now,
            "exp": now + JWTUtils.EXPIRATION,
            "jti": jti,
            "origIat": orig_iat.isoformat(),
        }
        return jwt.encode(payload, JWTUtils.SECRET_KEY, algorithm=JWTUtils.ALGORITHM)

    @staticmethod
    def decode_jwt_token(token: str) -> dict:

        data = jwt.decode(
            token,
            JWTUtils.SECRET_KEY,
            algorithms=[JWTUtils.ALGORITHM],
        )

        orig = datetime.fromisoformat(data["origIat"])
        if datetime.now(timezone.utc) - orig > JWTUtils.EXPIRATION:
            raise jwt.ExpiredSignatureError("Token exceeded maximum lifetime")

        data["sub"] = int(data["sub"])
        if data.get("userId") is not None:
            data["userId"] = int(data["userId"])
        if data.get("companyId") is not None:
            data["companyId"] = int(data["companyId"])

        return data

    @staticmethod
    def set_auth_cookie(response, token: str, name: str = "session_token"):
        expires = datetime.now(timezone.utc) + JWTUtils.EXPIRATION
        response.set_cookie(
            name,
            token,
            httponly=True,
            secure=True,
            samesite="Strict",
            path="/",
            expires=expires,
        )
        return response

    @staticmethod
    def get_token_from_cookie(name: str = "session_token"):
        return request.cookies.get(name)

    @staticmethod
    def remove_auth_cookie(response, name: str = "session_token"):
        response.delete_cookie(name, path="/")
        return response
