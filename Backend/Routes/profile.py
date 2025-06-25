from flask import Blueprint, request, jsonify
from Control.AccountControl import AccountControl
from Boundary.AccountBoundary import AccountBoundary
from Security.Limiter import limiter, get_account_key
from Security.ValidateFiles import enforce_image_limits, enforce_pdf_limits, sanitize_image, sanitize_pdf
from Security.ValidateInputs import validate_profile
from Security import SplunkUtils

SplunkLogging = SplunkUtils.SplunkLogger()

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")


@profile_bp.route("/<int:account_id>", methods=["GET"])
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
            "twoFaSecret": account.twoFaSecret,
        }

        optional_keys = [
            "bio",
            "portfolioUrl",
            "description",
            "location",
            "companyDocUrl",
            "verified",
            "companyId",
            "userId",
        ]
        optional_data = {
            key: getattr(account, key) for key in optional_keys if hasattr(account, key)
        }

        return jsonify({**base_data, **optional_data})

    else:
        SplunkLogging.send_log({
            "event": "Profile Access Failed",
            "reason": "Account not found",
            "accountId": account_id,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })
        return jsonify({"error": "Account not found"}), 404


@profile_bp.route("/save", methods=["POST"])
#@limiter.limit("1 per hour", key_func=get_account_key) # here is the issue that the profile cannot save
def save_profile():
    updated_data = request.form.to_dict()
    portfolioFile = request.files.get("portfolioFile", None)
    profilePic = request.files.get("profilePic", None)

    errors = validate_profile(updated_data)
    if errors:

        SplunkLogging.send_log({
            "event": "Profile Update Failed",
            "reason": "Validation error - input fields",
            "accountId": updated_data.get("accountId"),
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": errors}), 400

    if portfolioFile:
        try:
            enforce_pdf_limits(portfolioFile)
            portfolioFile = sanitize_pdf(portfolioFile)
        except Exception as e:

            SplunkLogging.send_log({
            "event": "Profile Update Failed",
            "reason": "Validation error - PDF",
            "accountId": updated_data.get("accountId"),
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
            })
            
            return jsonify({"error": str(e)}), 400
        
    if profilePic:
        try:
            enforce_image_limits(profilePic)
            profilePic = sanitize_image(profilePic)
        except Exception as e:

            SplunkLogging.send_log({
            "event": "Profile Update Failed",
            "reason": "Validation error - Profile picture",
            "accountId": updated_data.get("accountId"),
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
            })

            return jsonify({"error": str(e)}), 400

    updated_data["portfolioFile"] = portfolioFile
    updated_data["profilePic"] = profilePic

    success = AccountBoundary.saveProfile(updated_data)

    if success:

        SplunkLogging.send_log({
            "event": "Profile update success",
            "accountId": updated_data.get("accountId"),
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"message": "Profile saved successfully!"}), 201
    else:

        SplunkLogging.send_log({
            "event": "Profile Update failed",
            "reason": "Failed to save profile",
            "accountId": updated_data.get("accountId"),
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "Failed to save profile"}), 500


@profile_bp.route("/disable/<int:account_id>", methods=["POST"])
def disable(account_id):
    auth_data = request.get_json()

    success = AccountBoundary.disableAccount(account_id, auth_data)

    if success:

        SplunkLogging.send_log({
            "event": "Account Disabled success",
            "accountId": account_id,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"message": "Account disabled successfully!"}), 201
    else:

        SplunkLogging.send_log({
            "event": "Account Disable failed",
            "reason": "Failed to disable account",
            "accountId": account_id,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "Failed to disable account"}), 500


@profile_bp.route("/getAllCompanies", methods=["GET"])
def get_all_companies():
    """
    Retrieves all companies.
    :return: List of all companies.
    """
    companies = AccountBoundary.getAllCompanies()
    return jsonify([company.to_dict() for company in companies]), 200


@profile_bp.route(
    "/setCompanyVerified/<int:company_id>/<int:verified>", methods=["POST"]
)
def set_company_verified(company_id, verified):
    """
    Sets the verification status of a company.
    :param company_id: ID of the company to verify.
    :param verified: Verification status (1 for True, 0 for False).
    :return: Success message or error.
    """
    success = AccountBoundary.setCompanyVerified(company_id, verified)
    return (
        jsonify({"message": "Company verification status updated successfully!"})
        if success
        else jsonify({"error": "Failed to update company verification status"})
    ), 200
