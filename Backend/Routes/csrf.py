from flask import Blueprint, jsonify, make_response, request
from Utils.CsrfUtils import CsrfUtils

csrf_bp = Blueprint("csrf", __name__)


@csrf_bp.route("/csrf-token", methods=["GET"])
def get_csrf_token():
    session_id = request.cookies.get("session_token")
    
    secure_token, public_token = CsrfUtils.generate_csrf_token_pair(session_id)
    
    resp = make_response(jsonify({"csrfToken": public_token}))
    
    # Set HttpOnly cookie (server-side validation) - uses secure token
    resp.set_cookie(
        "csrf_token_secure",
        secure_token,
        httponly=True,  # Server-side only
        secure=True,
        samesite="Strict",
        path="/",
        max_age=3600  # 1 hour
    )
    
    # Set JavaScript-readable cookie (client-side access) - uses public token
    resp.set_cookie(
        "csrf_token",
        public_token,
        httponly=False,  # Client-side readable
        secure=True,
        samesite="Strict", 
        path="/",
        max_age=3600  # 1 hour
    )
    
    return resp
