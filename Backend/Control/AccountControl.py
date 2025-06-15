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
        account = Account.from_dict(accountData)

        return AccountMapper.createAccount(account)
    
    @staticmethod
    def getAccountById(accountId: int) -> Account:
        return AccountMapper.getAccountById(accountId)
    
    @staticmethod
    def updateAccount(accountData: dict) -> bool:
        role = accountData.get("role")
        role = Role(role)
        if role == Role.User:
            account = User.from_dict(accountData)
        elif role == Role.Company:
            account = Company.from_dict(accountData)
        else:
            print("Invalid or missing role")
            return False

        return AccountMapper.updateAccount(account)
    
    @staticmethod
    def disableAccount(accountId: int) -> bool:
        return AccountMapper.disableAccount(accountId)
    