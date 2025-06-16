from Boundary.Mapper.AccountMapper import AccountMapper
from SQLModels.AccountModel import Role
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company


class AccountControl:
    def __init__(self):
        pass

    @staticmethod
    def createAccount(accountData: dict) -> bool:
        # TODO: Hash password here before convert to Account type
        if "password" in accountData and accountData["password"]:
            # hashed = bcrypt.hashpw(accountData["password"].encode("utf-8"), bcrypt.gensalt())
            accountData["passwordHash"] = ""  # Store as string
            accountData["passwordSalt"] = ""
            del accountData["password"]  # Remove plain password

        account = Account.from_dict(accountData)

        return AccountMapper.createAccount(account)
    
    @staticmethod
    def authenticateAccount(accountData: dict) -> Account:
        email = accountData.get('email', '')
        account = AccountMapper.getAccountByEmail(email)
        
        password = accountData.get('password', '')
        salt = account.passwordSalt

        # TODO: Use salt to hash pass from authData and compare

        # salted_input = (password + salt).encode("utf-8")
        # hashed_input = hashlib.sha256(salted_input).hexdigest()

        # if hashed_input != account.passwordHash:
        #     print("Incorrect password")
        #     return None

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
        # Get associated account and check pw
        account = AccountMapper.getAccountById(accountId)

        # TODO: Use salt to hash pass from authData
        password = authData.get('password', '')
        salt = account.passwordSalt

        # salted_input = (password + salt).encode("utf-8")
        # hashed_input = hashlib.sha256(salted_input).hexdigest()

        # if hashed_input != account.passwordHash:
        #     print("Incorrect password")
        #     return False

        return AccountMapper.disableAccount(accountId)
    