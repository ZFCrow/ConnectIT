import jwt
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from flask import request

class JWTUtils:
    SECRET_KEY = os.getenv("JWT_SECRET")
    ALGORITHM  = "HS512"
    EXPIRATION = timedelta(days=1)

    @staticmethod
    def generate_jwt_token(
        account_id:      int,
        user_role:       str,
        name:            str,
        profile_pic_url: Optional[str] = None,
        user_id:         Optional[int] = None,
        company_id:      Optional[int] = None,
    ) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "exp":           now + JWTUtils.EXPIRATION,
            "iat":           now,
            "sub":           account_id,            # accountId
            "role":          user_role,             # role
            "name":          name,                  # name
            "profilePicUrl": profile_pic_url or None,
            "userId":        user_id,
            "companyId":     company_id,
            "jti":           os.urandom(16).hex()
        }
        return jwt.encode(payload, JWTUtils.SECRET_KEY, algorithm=JWTUtils.ALGORITHM)

    @staticmethod
    def set_auth_cookie(response, token: str, name: str = 'session_token'):
        expires = datetime.now(timezone.utc) + JWTUtils.EXPIRATION
        response.set_cookie(
            name,
            token,
            httponly=True,
            secure=True,
            samesite='Strict',
            expires=expires
        )
        return response

    
    def get_token_from_cookie():
        return request.cookies.get('session_token')

    
    def decode_jwt_token(token: str) -> dict:
        return jwt.decode(token, JWTUtils.SECRET_KEY, algorithms=[JWTUtils.ALGORITHM])
    

    def remove_auth_cookie(response, name: str = "session_token"):
    # Option A: use Flask's built-in delete_cookie
        response.delete_cookie(name, path='/')
        # — or, Option B: explicitly overwrite it with an expired cookie:
        # from datetime import datetime
        # response.set_cookie(
        #     name, "",
        #     httponly=True,
        #     secure=True,
        #     samesite="Strict",
        #     expires=datetime.now(timezone.utc) - timedelta(seconds=1)
        # )
        return response