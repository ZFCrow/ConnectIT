from flask import Blueprint, request, jsonify, abort, send_file
from Control.AccountControl import AccountControl
from Security.Limiter import limiter, get_account_key
from Security.ValidateFiles import (
    enforce_image_limits,
    enforce_pdf_limits,
    sanitize_image,
    sanitize_pdf,
)
from Security.ValidateInputs import validate_profile
from Security.AuthUtils import verify_hash_password, hash_password
from Security.JWTUtils import JWTUtils
from Security import SplunkUtils
from SQLModels.AccountModel import Role
from Utils.UploadDocUtil import download_by_uri
from Security.FileEncUtils import decrypt_file_gcm
from io import BytesIO
import re

SplunkLogging = SplunkUtils.SplunkLogger()

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")


def _authenticate():
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401, description="Authentication required")
    try:
        claims = JWTUtils.decode_jwt_token(token)
    except Exception:
        abort(401, description="Invalid or expired token")
    return claims


@profile_bp.route("/<int:account_id>", methods=["GET"])
def get_user(account_id):

    account = AccountControl.getAccountById(account_id)

    if account:
        base_data = {
            "accountId": account.accountId,
            "name": account.name,
            "email": account.email,
            "passwordHash": account.passwordHash,
            "role": (
                account.role if isinstance(account.role, str) else account.role.value
            ),
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
        SplunkLogging.send_log(
            {
                "event": "Profile Access Failed",
                "reason": "Account not found",
                "accountId": account_id,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"error": "Account not found"}), 404


@profile_bp.route("/save", methods=["POST"])
#@limiter.limit("1 per hour", key_func=get_account_key)
def save_profile():
    claims = _authenticate()
    user_id = claims.get("sub")
    updated_data = request.form.to_dict()
    try:
        form_account_id = int(updated_data.get("accountId", user_id))
    except ValueError:
        abort(400, description="Invalid accountId in form data")
    if user_id != form_account_id:
        abort(403, description="Forbidden to update this profile")

    updated_data["accountId"] = form_account_id

    portfolioFile = request.files.get("portfolioFile", None)
    profilePic = request.files.get("profilePic", None)

    errors = validate_profile(updated_data)
    if errors:

        SplunkLogging.send_log(
            {
                "event": "Profile Update Failed",
                "reason": errors,
                "accountId": updated_data.get("accountId"),
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": errors}), 400

    account = AccountControl.getAccountById(form_account_id)

    if (updated_data.get("password") and updated_data.get("newPassword")
       and updated_data.get("confirmNew")):

        if not verify_hash_password(updated_data['password'], account.passwordHash):
            return jsonify({"error": "Incorrect old password"}), 400

        if updated_data["newPassword"] != updated_data["confirmNew"]:
            return jsonify({"error": "Passwords do not match"}), 400

        updated_data["passwordHash"] = hash_password(updated_data["newPassword"])

        updated_data.pop("password", None)
        updated_data.pop("newPassword", None)
        updated_data.pop("confirmNew", None)

    if portfolioFile:
        try:
            enforce_pdf_limits(portfolioFile)
            portfolioFile = sanitize_pdf(portfolioFile)
        except Exception as e:

            SplunkLogging.send_log(
                {
                    "event": "Profile Update Failed",
                    "reason": "Validation error - PDF",
                    "accountId": updated_data.get("accountId"),
                    "ip": SplunkLogging.get_real_ip(request),
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )

            return jsonify({"error": str(e)}), 400

    if profilePic:
        try:
            enforce_image_limits(profilePic)
            profilePic = sanitize_image(profilePic)
        except Exception as e:

            SplunkLogging.send_log(
                {
                    "event": "Profile Update Failed",
                    "reason": "Validation error - Profile picture",
                    "accountId": updated_data.get("accountId"),
                    "ip": SplunkLogging.get_real_ip(request),
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path,
                }
            )

            return jsonify({"error": str(e)}), 400

    updated_data["portfolioFile"] = portfolioFile
    updated_data["profilePic"] = profilePic

    success = AccountControl.updateAccount(updated_data)

    if success:

        SplunkLogging.send_log(
            {
                "event": "Profile Update Success",
                "accountId": updated_data.get("accountId"),
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "Profile saved successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Profile Update Failed",
                "reason": "Failed to save profile",
                "accountId": updated_data.get("accountId"),
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to save profile"}), 500


@profile_bp.route("/disable/<int:account_id>", methods=["POST"])
def disable(account_id):
    claims = _authenticate()
    user_id = claims.get("sub")
    if user_id != account_id:
        abort(403, description="Forbidden to disable this account")

    auth_data = request.get_json()

    success = AccountControl.disableAccount(account_id, auth_data)

    if success:

        SplunkLogging.send_log(
            {
                "event": "Account Disabled Success",
                "accountId": account_id,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        resp = jsonify({"message": "Account disabled successfully!"})
        resp = JWTUtils.remove_auth_cookie(resp)
        return resp, 201

    else:

        SplunkLogging.send_log(
            {
                "event": "Account Disable Failed",
                "reason": "Failed to disable account",
                "accountId": account_id,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to disable account"}), 500


@profile_bp.route("/portfolio/view", methods=["GET"])
def view_portfolio():
    claims = _authenticate()
    user_id = claims.get("sub")

    gs_uri = request.args.get("uri")
    if not gs_uri or not gs_uri.startswith("gs://"):
        abort(400, description="Missing or invalid URI")
    else:
        gs_uri = gs_uri.split("?", 1)[0]

    # Check file ownership
    match = re.search(r"portfolio/user_(\d+)\.enc", gs_uri)
    if not match or int(match.group(1)) != user_id:
        abort(403, description="You may only access your own file")

    try:
        enc_bytes = download_by_uri(gs_uri)
        decrypted = decrypt_file_gcm(BytesIO(enc_bytes))

        return send_file(
            decrypted,
            mimetype="application/pdf",
            as_attachment=False,
            download_name=f"user_{user_id}.pdf",
        )

    except (PermissionError, FileNotFoundError, ValueError) as e:
        abort(403, description=str(e))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@profile_bp.route("/getAllCompanies", methods=["GET"])
def get_all_companies():
    """
    Retrieves all companies.
    :return: List of all companies.
    """
    companies = AccountControl.getAllCompanies()
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
    claims = _authenticate()
    if claims.get("role") != Role.Admin.value:
        abort(403, description="Forbidden")
    success = AccountControl.setCompanyVerified(company_id, verified)
    return (
        jsonify({"message": "Company verification status updated successfully!"})
        if success
        else jsonify({"error": "Failed to update company verification status"})
    ), 200


@profile_bp.route("/companydoc/view", methods=["GET"])
def view_companydoc():
    claims = _authenticate()
    if claims.get("role") != Role.Admin.value:
        abort(403, description="Forbidden")

    gs_uri = request.args.get("uri")
    if not gs_uri or not gs_uri.startswith("gs://"):
        abort(400, description="Missing or invalid URI")
    else:
        gs_uri = gs_uri.split("?", 1)[0]

    # Check file ownership
    match = re.search(r"companyDocument/company_(\d+)\.enc", gs_uri)
    if not match:
        abort(400, description="Invalid resume filename format")

    company_id = match.group(1)

    try:
        enc_bytes = download_by_uri(gs_uri)
        decrypted = decrypt_file_gcm(BytesIO(enc_bytes))

        return send_file(
            decrypted,
            mimetype="application/pdf",
            as_attachment=False,
            download_name=f"company_{company_id}.pdf",
        )

    except (PermissionError, FileNotFoundError, ValueError) as e:
        abort(403, description=str(e))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
