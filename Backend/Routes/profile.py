from flask import Blueprint, request, jsonify
from Boundary.AccountBoundary import AccountBoundary

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")

@profile_bp.route('/<int:account_id>', methods=['GET'])
def get_user(account_id):
    account = AccountBoundary.viewAccount(account_id)

    if account:
        base_data = {
            "accountId": account.accountId,
            "name": account.name,
            "email": account.email,
            "passwordHash": account.passwordHash,
            "role": account.role,
            "isDisabled": account.isDisabled,
            "profilePicUrl": account.profilePicUrl
        }

        optional_keys = ["bio", "portfolioUrl", "description", "location", "verified"]
        optional_data = {key: getattr(account, key) for key in optional_keys if hasattr(account, key)}

        return jsonify({**base_data, **optional_data})
    
    else:
        return jsonify({"error": "Account not found"}), 404

@profile_bp.route('/save', methods=['POST'])
def save_profile():
    updated_data = request.get_json()
    success = AccountBoundary.saveProfile(updated_data)

    if success:
        return jsonify({"message": "Profile saved successfully!"}), 201
    else:
        return jsonify({"error": "Failed to save profile"}), 500
    
@profile_bp.route('/disable/<int:account_id>', methods=['POST'])
def disable(account_id):
    auth_data = request.get_json()

    success = AccountBoundary.disableAccount(account_id, auth_data)

    if success:
        return jsonify({"message": "Account disabled successfully!"}), 201
    else:
        return jsonify({"error": "Failed to disable account"}), 500
