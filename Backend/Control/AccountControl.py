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
            dest_name = "companyDocument/company_temp.pdf"
            doc_url = upload_to_path(companyDoc, target_path=dest_name, public=True)
            accountData["companyDocUrl"] = doc_url

        account = Account.from_dict(accountData)
        if accountData["role"] == Role.Company.value:
            account = Company.from_dict(accountData)

        return AccountMapper.createAccount(account)

    @staticmethod
    def authenticateAccount(accountData: dict) -> Account:
        email = accountData.get("email", "")

        account = AccountMapper.getAccountByEmail(email)

        password = accountData.get("password", "")

        auth = AuthUtils.verify_hash_password(password, account.passwordHash)

        if not auth:
            return None

        return account

    @staticmethod
    def getAccountById(accountId: int) -> Account:
        return AccountMapper.getAccountById(accountId)

    @staticmethod
    def updateAccount(accountData: dict) -> bool:
        password = accountData.get("password", "")
        newPass = accountData.get("newPassword", "")
        confirmPass = accountData.get("confirmNew", "")
        account_id = accountData["accountId"]

        # Get the existing account to access the stored hash/salt
        target_acc = AccountMapper.getAccountById(account_id)

        # Only if ALL password-related field are filled,
        # validate and attempt update
        # This abit weird, might need change
        if password and newPass and confirmPass:
            # Verify old password
            if not AuthUtils.verify_hash_password(password, target_acc.passwordHash):
                print("Old password is incorrect.")
                return False

            # Check new passwords match
            if newPass != "" and confirmPass != "" and newPass != confirmPass:
                print("New passwords do not match.")
                return False

            # Generate new hash and salt for the new password
            new_hash = AuthUtils.hash_password(newPass)
            accountData["passwordHash"] = new_hash

        # Remove password fields that aren't used in database
        accountData.pop("password", None)
        accountData.pop("newPassword", None)
        accountData.pop("confirmNew", None)

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
            # dest_name = f"portfolio/user_{account_id}.pdf"
            # resume_url = upload_to_path(
            #     portfolioFile, target_path=dest_name, public=True
            # )
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
