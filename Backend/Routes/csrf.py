from flask import Blueprint, jsonify, make_response
from flask_wtf.csrf import generate_csrf

csrf_bp = Blueprint("csrf", __name__)


@csrf_bp.route("/csrf-token", methods=["GET"])
def get_csrf_token():
    token = generate_csrf()
    resp = make_response(jsonify({"csrfToken": token}))
    resp.set_cookie(
        "csrf_token",
        token,
        httponly=True,
        secure=True,
        samesite="None",
        path="/",
    )
    return resp
