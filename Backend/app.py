# from pathlib import Path
# from dotenv import load_dotenv , find_dotenv
# # Read host, port, and debug from env, with sensible defaults
# # automatically finds the nearest .env file by walking up
# env_path = find_dotenv(usecwd=True)
# if not env_path:
#     raise RuntimeError("Couldn't locate a .env file")
# load_dotenv(env_path, override=False)

# # then load .env.dev if present, overriding vars
# dev_env = Path(env_path).parent / ".env.dev"
# if dev_env.exists():
#     load_dotenv(dev_env, override=True)


from typing import BinaryIO, Literal
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import os
from db import sshFlow, noSshFlow
from SQLModels.base import DatabaseContext

from Routes.profile import profile_bp
from Routes.auth import auth_bp
from Routes.job import job_listing_bp
from Routes.label import label_bp 
from Routes.violation import violation_bp 
from Routes.comment import comment_bp 
from Routes.post import post_bp 


from Security import ValidateCaptcha, TwoFactorAuth
from firebase_admin import credentials, initialize_app, storage

app = Flask(__name__) 


# allow all domains to access the API 
app.register_blueprint(profile_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(job_listing_bp) 
app.register_blueprint(label_bp)
app.register_blueprint(violation_bp)
app.register_blueprint(comment_bp)
app.register_blueprint(post_bp)
  


CORS(app)


@app.route("/")
def index():
    print("request from")
    return jsonify({"message": "Welcome to the API!"})


@app.route("/hello")
def hello():
    print("request from")
    return jsonify({"message": "hello to the API!", "status": 169})


@app.route("/test")
def test():
    # useSSH = os.environ.get("USE_SSH_TUNNEL",6 "False").lower() in ("1", "true", "yes")
    useSSH = os.environ.get("USE_SSH_TUNNEL") in ("1", "true", "yes")
    if useSSH:
        print("ssh is turned on")
        ans = sshFlow()
        return jsonify(
            {
                "message": "database records fetched from API! ssh",
                "status": 169,
                "ans": ans,
                "useSSH": useSSH,
            }
        )
    else:
        print("ssh is turned off")
        ans = noSshFlow()
        return jsonify(
            {
                "message": "database records fetched from API! no ssh",
                "status": 169,
                "ans": ans,
                "useSSH": useSSH,
            }
        )


@app.route("/initDB")
def init_db():

    db = DatabaseContext()
    success = (
        db.initialize()
    )  # Initialize the database connection and create tables if they don't exist
    if success:
        tables = db.get_tables()  # Get the list of tables in the database

        print (f"Tables in the database: {tables}") 
        return jsonify({
                        "message": "Database initialized successfully!",
                        "tables": tables})  
    else: 
        return jsonify({"message": "Database initialization failed!"}), 500 
    

    
# Route for HCaptcha token verification
@app.route("/verify-captcha", methods=["POST"])
def verify_captcha_endpoint():
    print("Received request at /verify-captcha endpoint.")
    data = request.get_json()
    token = data.get("token")

    if not token:
        return jsonify({"success": False, "message": "Missing CAPTCHA token"}), 400

    result = ValidateCaptcha.verify_hcaptcha(token)
    print(f"Token received: {token}")

    return jsonify(result), 200 if result["success"] else 400


# Route for 2FA Qr-code generation
@app.route("/2fa-generate", methods=["POST"])
def generate_2fa():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Missing email"}), 400

    result = TwoFactorAuth.create_qrcode(email)
    return (
        jsonify(result),
        200,
    )

# # Route for 2FA code verification
@app.route("/2fa-verify", methods=["POST"])
def verify_2fa():
    code = request.json.get("code")
    secret = request.json.get("secret")

    result, status_code = TwoFactorAuth.validate2FA(code, secret)

    return jsonify(result), status_code


if __name__ == "__main__":

    host = os.environ.get("FLASK_RUN_HOST")
    port = int(os.environ.get("FLASK_RUN_PORT"))
    debug = os.environ.get("FLASK_DEBUG").lower() in ("1", "true", "yes")

    app.run(host=host, port=port, debug=debug)
