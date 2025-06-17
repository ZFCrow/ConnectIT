from Boundary.Mapper.AccountMapper import AccountMapper
from SQLModels.AccountModel import Role
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company
from Security import AuthUtils


class AccountControl:
    def __init__(self):
        pass

    @staticmethod
    def createAccount(accountData: dict) -> bool:
        if "password" in accountData and accountData["password"]:
            accountData["passwordHash"] = AuthUtils.hash_password(accountData["password"])
            del accountData["password"]  # Remove plain password

        account = Account.from_dict(accountData)

        return AccountMapper.createAccount(account)
    
    @staticmethod
    def authenticateAccount(accountData: dict) -> Account:
        email = accountData.get('email', '')
        account = AccountMapper.getAccountByEmail(email)
        
        password = accountData.get('password', '')

        auth = AuthUtils.verify_hash_password(password, account.passwordHash)

        if not auth:
            return None

        return account
    
    @staticmethod
    def getAccountById(accountId: int) -> Account:
        return AccountMapper.getAccountById(accountId)
    
    @staticmethod
    def updateAccount(accountData: dict) -> bool:
        account = Account.from_dict(accountData)

        # TODO: Get Old PW from acc, crosscheck with dict PW, if ok hash New PW
        # and pass new hash and salt to dict before conversion

        if account.role == Role.User.value:
            account = User.from_dict(accountData)
        elif account.role == Role.Company.value:
            account = Company.from_dict(accountData)
        else:
            print("Invalid or missing role")
            return False

        return AccountMapper.updateAccount(account)
    
    @staticmethod
    def disableAccount(accountId: int, authData: dict) -> bool:
        account = AccountMapper.getAccountById(accountId)

        password = authData.get('password', '')

        auth = AuthUtils.verify_hash_password(password, account.passwordHash)

        if not auth:
            return False

        return AccountMapper.disableAccount(accountId)
    