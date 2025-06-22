from flask import Blueprint, request, jsonify
from Control.AccountControl import AccountControl
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
            "profilePicUrl": account.profilePicUrl,
            "twoFaEnabled": account.twoFaEnabled,
            "twoFaSecret": account.twoFaSecret
        }

        optional_keys = ["bio", "portfolioUrl", "description", 
                         "location", "companyDocUrl", "verified",
                         "companyId", "userId"]
        optional_data = {key: getattr(account, key) for key in optional_keys if hasattr(account, key)}

        return jsonify({**base_data, **optional_data})
    
    else:
        return jsonify({"error": "Account not found"}), 404

@profile_bp.route('/save', methods=['POST'])
def save_profile():
    updated_data = request.form.to_dict()
    portfolioFile = request.files.get('portfolioFile', None)
    profilePic = request.files.get('profilePic', None)

    updated_data['portfolioFile'] = portfolioFile
    updated_data['profilePic'] =  profilePic

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
    
@profile_bp.route("/getAllCompanies", methods=["GET"])
def get_all_companies():
    """
    Retrieves all companies.
    :return: List of all companies.
    """
    companies = AccountBoundary.getAllCompanies()
    return jsonify([company.to_dict() for company in companies]), 200

@profile_bp.route("/setCompanyVerified/<int:company_id>/<int:verified>", methods=["POST"])
def set_company_verified(company_id, verified):
    """
    Sets the verification status of a company.
    :param company_id: ID of the company to verify.
    :param verified: Verification status (1 for True, 0 for False).
    :return: Success message or error.
    """
    success = AccountBoundary.setCompanyVerified(company_id, verified)
    return jsonify({"message": "Company verification status updated successfully!"}) if success else jsonify({"error": "Failed to update company verification status"}), 200