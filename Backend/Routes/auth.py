from flask import Blueprint, request, jsonify, make_response
from Boundary.AccountBoundary import AccountBoundary
from SQLModels.AccountModel import Role
from Security.ValidateInputs import validate_register, validate_login
from Security.JWTUtils import JWTUtils

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    payload = request.form.to_dict()
    errors = validate_register(payload)

    if errors:
        return jsonify({"errors": errors}), 400
    
    if payload['role'] == Role.Company.value:
        companyDoc = request.files.get('companyDoc', None)
        if not companyDoc:
            return jsonify({"error": "Verification document required"}), 500
        
        payload['companyDoc'] = companyDoc

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

    account = AccountBoundary.loginAccount(payload)
    if not account:
        return jsonify({"message": "Incorrect credentials"}), 401

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

        optional_keys = ["bio", "portfolioUrl", "description", "location",
                          "verified", "companyId", "userId", "companyDocUrl"]
        optional_data = {key: getattr(account, key) for key in optional_keys if hasattr(account, key)}

        token = JWTUtils.generate_jwt_token(account.accountId,
        account.role,
        account.name,
        getattr(account, "profilePicUrl", None),
        getattr(account, "userId", None),
        getattr(account, "companyId", None),)
        print(token)
        if not token:
            return jsonify({"message": "Token generation failed"}), 500
        
        
        # **Merge** the two dicts correctly (not as a set!) :contentReference[oaicite:0]{index=0}
        merged = {**base_data, **optional_data}

        # make the Flask response and set the HttpOnly cookie :contentReference[oaicite:1]{index=1}
        resp = make_response(jsonify(merged), 200)
        resp = JWTUtils.set_auth_cookie(resp, token)

        return resp
            
    else:
        return jsonify({"message": "Incorrect credentials"}), 500
    
@auth_bp.route('/save2fa', methods=['POST'])
def save2fa():
    payload = request.get_json()
    if payload['accountId'] is None:
        return jsonify({"error": "No account Id"}), 401

    success = AccountBoundary.saveTwoFa(payload['accountId'], payload)

    if success:
        return jsonify({"message": "2fa updated successfully!"}), 201
    else:
        return jsonify({"error": "Failed to update 2fa"}), 500

