import time
import uuid

from flask import jsonify
from Services.AuthService import AuthService
from Boundary.Mapper.AccountMapper import AccountMapper
from SQLModels.AccountModel import Role
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company
from Utils.UploadDocUtil import upload_to_path
from Security import AuthUtils, FileEncUtils


class AccountControl:
    def __init__(self):
        pass

    @staticmethod
    def createAccount(accountData: dict) -> bool:
        if "password" in accountData and accountData["password"]:
            accountData["passwordHash"] = AuthUtils.hash_password(
                accountData["password"]
            )
            del accountData["password"]  # Remove plain password

        companyDoc = accountData.get("companyDoc", None)
        doc_url = None
        if companyDoc:
            encrypted_file = FileEncUtils.encrypt_file_gcm(companyDoc)
            dest_name = "companyDocument/company_temp.enc"
            doc_url = upload_to_path(
                encrypted_file, target_path=dest_name, public=False
            )
            accountData["companyDocUrl"] = doc_url

        account = Account.from_dict(accountData)
        if accountData["role"] == Role.Company.value:
            account = Company.from_dict(accountData)
        success, errorMsg = AccountMapper.createAccount(account)
        return success, errorMsg

    @staticmethod
    def authenticateAccount(payload: dict) -> Account:
        start_time = time.time()  # Start timer

        email = payload.get("email")
        captcha_token = payload.get("captchaToken")

        isLocked, msg = AuthService.checkIsLocked(email)
        if isLocked:
            return jsonify({"error": msg}), 403

        # Verify CAPTCHA if required
        captchaMsg = AuthService.handleCaptchaForLogin(email, captcha_token)
        if captchaMsg is not None:
            return (
                jsonify(
                    {
                        "message": captchaMsg,
                        "showCaptcha": True,
                    }
                ),
                400,
            )

        validationErrors = AuthService.validateLogin(payload)
        if validationErrors:
            return jsonify({"error": validationErrors}), 400
        account = AccountMapper.getAccountByEmail(email)

        duration_ms = round((time.time() - start_time) * 1000, 2)
        if not account:
            attemptMsg, errorCode = AuthService.incrementFailedAttempts(
                email, duration_ms
            )
            if attemptMsg:
                return jsonify({"message": attemptMsg}), errorCode

        if account:
            if account.isDisabled:
                return jsonify({"message": "Account is disabled"}), 403

            password = payload.get("password", "")

            auth = AuthService.verify_hash_password(password, account.passwordHash)

            if not auth:
                attemptMsg, errorCode = AuthService.incrementFailedAttempts(
                    email, duration_ms
                )
                if attemptMsg:
                    return jsonify({"message": attemptMsg}), errorCode
            new_jti = str(uuid.uuid4())
            base_data = {
                "accountId": account.accountId,
                "name": account.name,
                "email": account.email,
                "passwordHash": account.passwordHash,
                "role": (
                    account.role
                    if isinstance(account.role, str)
                    else account.role.value
                ),
                "isDisabled": account.isDisabled,
                "profilePicUrl": account.profilePicUrl,
                "twoFaEnabled": account.twoFaEnabled,
                "twoFaSecret": account.twoFaSecret,
                "jti": new_jti,
            }

            optional_keys = [
                "bio",
                "portfolioUrl",
                "description",
                "location",
                "verified",
                "companyId",
                "userId",
                "companyDocUrl",
            ]
            optional_data = {
                key: getattr(account, key)
                for key in optional_keys
                if hasattr(account, key)
            }

            merged = {**base_data, **optional_data}
            AuthService.resetLoginAttempts(email)

            return jsonify(merged), 200

    @staticmethod
    def getAccountById(accountId: int) -> Account:
        return AccountMapper.getAccountById(accountId)

    @staticmethod
    def updateAccount(accountData: dict) -> bool:
        account_id = accountData["accountId"]

        profilePic = accountData.get("profilePic")
        profilePic_url = None

        if profilePic:
            dest_name = f"profilePic/acc_{account_id}.png"
            profilePic_url = upload_to_path(
                profilePic, target_path=dest_name, public=True
            )

        accountData["profilePicUrl"] = profilePic_url

        portfolioFile = accountData.get("portfolioFile")
        resume_url = None

        if portfolioFile:
            encrypted_file = FileEncUtils.encrypt_file_gcm(portfolioFile)
            dest_name = f"portfolio/user_{account_id}.enc"

            resume_url = upload_to_path(
                encrypted_file, target_path=dest_name, public=False
            )

        accountData["portfolioUrl"] = resume_url

        account = Account.from_dict(accountData)

        # Now construct entity after password check
        role = accountData.get("role", "")
        if role == Role.User.value:
            account = User.from_dict(accountData)
        elif role == Role.Company.value:
            account = Company.from_dict(accountData)
        else:
            print("Invalid or missing role")
            return False

        return AccountMapper.updateAccount(account)

    @staticmethod
    def disableAccount(accountId: int, authData: dict) -> bool:
        account = AccountMapper.getAccountById(accountId)

        password = authData.get("password", "")

        auth = AuthUtils.verify_hash_password(password, account.passwordHash)

        if not auth:
            return False

        return AccountMapper.disableAccount(accountId)

    @staticmethod
    def setTwoFa(accountId: int, data: dict) -> bool:
        secret = data.get("secret", None)
        enabled = data.get("enabled", None)

        if not secret or not enabled:
            return False

        return AccountMapper.setTwoFa(accountId, secret, enabled)

    @staticmethod
    def setSessionId(accountId: int, data: dict) -> bool:
        sessionId = data.get("sessionId", None)

        if not sessionId:
            return False

        return AccountMapper.setSessionId(accountId, sessionId)

    @staticmethod
    def getAllCompanies():
        """
        Retrieves all companies.
        :return: List of all companies.
        """
        print("Retrieving all companies")
        return AccountMapper.getAllCompanies()

    @staticmethod
    def setCompanyVerified(company_id: int, verified: int):
        """
        Sets the verification status of a company.
        :param company_id: ID of the company to verify.
        :param verified: True if the company is verified, False otherwise.
        :return: True if the operation was successful, False otherwise.
        """
        print(f"Setting company {company_id} verified status to {verified}")
        return AccountMapper.setCompanyVerified(company_id, verified)
