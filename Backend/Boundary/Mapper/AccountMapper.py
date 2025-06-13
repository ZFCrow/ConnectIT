from SQLModels.base import db_context
from SQLModels.AccountModel import AccountModel, Role
from SQLModels.UserModel import UserModel
from SQLModels.CompanyModel import CompanyModel
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company
from typing import Optional
import traceback


class AccountMapper:

    @staticmethod
    def getAccountById(accountId) -> Optional[Account]:
        with db_context.session_scope() as session:
            account = session.query(AccountModel).filter(AccountModel.accountId == accountId).first()
            
            if not account:
                return None

            account_data = account.to_dict()

            if account_data['role'] == Role.User.value:
                user_model = session.query(UserModel).filter(UserModel.accountId == accountId).first()
                if user_model:
                    user_data = user_model.to_dict()
                    user_data.update(account_data)  # Add account data to user
                    return User.from_dict(user_data)

            elif account_data['role'] == Role.Company.value:
                company_model = session.query(CompanyModel).filter(CompanyModel.accountId == accountId).first()
                if company_model:
                    company_data = company_model.to_dict()
                    company_data.update(account_data)  # Add account data to company
                    return Company.from_dict(company_data)
            
    @staticmethod
    def createAccount(account: Account) -> bool:
        try:
            with db_context.session_scope() as session:
                accountModel = AccountModel(
                    name=account.name,
                    email=account.email,
                    passwordHash=account.passwordHash,
                    passwordSalt=account.passwordSalt,
                    role=account.role
                )
                session.add(accountModel)
                session.flush()

                account.accountId = accountModel.accountId

                if account.role == Role.User.value:
                    userModel = UserModel(accountId=accountModel.accountId)
                    session.add(userModel)

                elif account.role == Role.Company.value:
                    companyModel = CompanyModel(accountId=accountModel.accountId)
                    session.add(companyModel)

                session.commit()
                return True
            
        except Exception as e:
            print(f"Error creating account: {e}")
            traceback.print_exc()
            return False
        