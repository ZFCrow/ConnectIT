from flask import Blueprint, request, jsonify
from Boundary.AccountBoundary import AccountBoundary

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    accountData = request.get_json()
    success = AccountBoundary.registerAccount(accountData)

    if success:
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create account"}), 500
    
@auth_bp.route('/login', methods=['POST'])
def login():
    accountData = request.get_json()
    account = AccountBoundary.loginAccount(accountData)

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

        return jsonify({**base_data, **optional_data})
    else:
        return jsonify({"message": "Incorrect credentials"}), 500

