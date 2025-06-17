from flask import Blueprint, request, jsonify
from Boundary.AccountBoundary import AccountBoundary
from Security.ValidateInputs import validate_register, validate_login

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    payload = request.get_json() or {}
    errors = validate_register(payload)
    if errors:
        return jsonify({"errors": errors}), 400

    #accountData = request.get_json()
    success = AccountBoundary.registerAccount(payload)

    if success:
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create account"}), 500
    
@auth_bp.route('/login', methods=['POST'])
def login():
    payload = request.get_json() or {}
    errors = validate_login(payload)
    if errors:
        return jsonify({"errors": errors}), 400

    #accountData = request.get_json()
    account = AccountBoundary.loginAccount(payload)
    if not account:
        return jsonify({"message": "Incorrect credentials"}), 401

    if account:
        base_data = {
            "accountId": account.accountId,
            "name": account.name,
            "email": account.email,
            "passwordHash": account.passwordHash,
            "passwordSalt": account.passwordSalt,
            "role": account.role,
            "isDisabled": account.isDisabled,
            "profilePicUrl": account.profilePicUrl
        }

        optional_keys = ["bio", "portfolioUrl", "description", "location", "verified"]
        optional_data = {key: getattr(account, key) for key in optional_keys if hasattr(account, key)}

        return jsonify({**base_data, **optional_data}), 200
    else:
        return jsonify({"message": "Incorrect credentials"}), 500

