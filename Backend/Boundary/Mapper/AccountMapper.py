from SQLModels.base import db_context
from SQLModels.AccountModel import AccountModel, Role
from SQLModels.UserModel import UserModel
from SQLModels.CompanyModel import CompanyModel
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company
from typing import Optional
from sqlalchemy.orm import joinedload
import traceback


class AccountMapper:

    @staticmethod
    def getAccountById(accountId) -> Optional[Account]:
        with db_context.session_scope() as session:
            account = session.query(AccountModel)\
                .options(joinedload(AccountModel.user), joinedload(AccountModel.company))\
                .filter(AccountModel.accountId == accountId)\
                .first()

            if not account:
                return None

            account_data = account.to_dict()

            if account.role == Role.User:
                if account.user:
                    user_data = account.user.to_dict()
                    user_data.update(account_data)
                    return User.from_dict(user_data)

            elif account.role == Role.Company:
                if account.company:
                    company_data = account.company.to_dict()
                    company_data.update(account_data)
                    return Company.from_dict(company_data)
                
            elif account.role == Role.Admin:
                return Account.from_dict(account_data)
            
    @staticmethod
    def getAccountByEmail(email) -> Optional[Account]:
        with db_context.session_scope() as session:
            account = session.query(AccountModel)\
                .options(joinedload(AccountModel.user), joinedload(AccountModel.company))\
                .filter(AccountModel.email == email)\
                .first()
            
            if not account:
                return None

            account_data = account.to_dict()

            if account.role == Role.User:
                if account.user:
                    user_data = account.user.to_dict()
                    user_data.update(account_data)
                    return User.from_dict(user_data)

            elif account.role == Role.Company:
                if account.company:
                    company_data = account.company.to_dict()
                    company_data.update(account_data)
                    return Company.from_dict(company_data)
                
            elif account.role == Role.Admin:
                return Account.from_dict(account_data)
            
    @staticmethod
    def createAccount(account: Account) -> bool:
        try:
            with db_context.session_scope() as session:
                accountModel = AccountModel(
                    name=account.name,
                    email=account.email,
                    passwordHash=account.passwordHash,
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
        
    @staticmethod
    def updateAccount(account: Account) -> bool:
        try:
            with db_context.session_scope() as session:
                accountModel = session.query(AccountModel).filter_by(accountId=account.accountId).first()
                
                if not accountModel:
                    print(f"No account found with ID: {account.accountId}")
                    return False

                # Update base Account fields
                accountModel.name = account.name
                if hasattr(account, "profilePicUrl") and account.profilePicUrl != '':
                    accountModel.profilePicUrl = getattr(account, "profilePicUrl") 

                # Role-specific updates
                if accountModel.role == Role.User:
                    userModel = session.query(UserModel).filter_by(accountId=account.accountId).first()
                    if userModel:
                        userModel.bio = getattr(account, "bio", userModel.bio)
                        userModel.portfolioUrl = getattr(account, "portfolioUrl", userModel.portfolioUrl)

                elif accountModel.role == Role.Company:
                    companyModel = session.query(CompanyModel).filter_by(accountId=account.accountId).first()
                    if companyModel:
                        companyModel.description = getattr(account, "description", companyModel.description)
                        companyModel.location = getattr(account, "location", companyModel.location)

                session.commit()
                return True

        except Exception as e:
            print(f"Error updating account: {e}")
            traceback.print_exc()
            return False
        

    @staticmethod
    def disableAccount(accountId: int) -> bool:
        try:
            with db_context.session_scope() as session:
                accountModel = session.query(AccountModel).filter_by(accountId=accountId).first()
                
                if not accountModel:
                    print(f"No account found with ID: {accountId}")
                    return False

                accountModel.isDisabled = True

                session.commit()
                return True

        except Exception as e:
            print(f"Error updating account: {e}")
            traceback.print_exc()
            return False
        