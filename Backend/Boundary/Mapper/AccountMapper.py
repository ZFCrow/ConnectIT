from SQLModels.base import db_context
from SQLModels.AccountModel import AccountModel, Role
from SQLModels.UserModel import UserModel
from SQLModels.CompanyModel import CompanyModel
from Entity.Account import Account
from Entity.User import User
from Entity.Company import Company
from Utils.UploadDocUtil import rename_file
from typing import Optional
from sqlalchemy.orm import joinedload
import traceback


class AccountMapper:

    @staticmethod
    def getAccountById(accountId) -> Optional[Account]:
        with db_context.session_scope() as session:
            account = (
                session.query(AccountModel)
                .options(
                    joinedload(AccountModel.user), joinedload(AccountModel.company)
                )
                .filter(AccountModel.accountId == accountId)
                .first()
            )

            if not account:
                return None

            account_data = Account.from_AccountModel(account)

            # Role-specific conversion
            if account.role == Role.User:
                if account.user:
                    return User.from_UserModel(account.user)

            elif account.role == Role.Company:
                if account.company:
                    return Company.from_CompanyModel(account.company)

            elif account.role == Role.Admin:
                return account_data  # Already an Account entity

    @staticmethod
    def getAccountByEmail(email) -> Optional[Account]:
        with db_context.session_scope() as session:
            account = (
                session.query(AccountModel)
                .options(
                    joinedload(AccountModel.user), joinedload(AccountModel.company)
                )
                .filter(AccountModel.email == email)
                .first()
            )

            if not account:
                return None

            account_data = Account.from_AccountModel(account)

            # Role-specific conversion
            if account.role == Role.User:
                if account.user:
                    return User.from_UserModel(account.user)

            elif account.role == Role.Company:
                if account.company:
                    return Company.from_CompanyModel(account.company)

            elif account.role == Role.Admin:
                return account_data  # Already an Account entity

    @staticmethod
    def createAccount(account: Account) -> bool:
        try:
            with db_context.session_scope() as session:
                accountModel = AccountModel(
                    name=account.name,
                    email=account.email,
                    passwordHash=account.passwordHash,
                    role=account.role,
                )
                session.add(accountModel)
                session.flush()

                account.setAccountId(accountModel.accountId)

                if account.role == Role.User.value:
                    userModel = UserModel(accountId=accountModel.accountId)
                    session.add(userModel)

                elif account.role == Role.Company.value:
                    new_url = rename_file(
                        "companyDocument/company_temp.enc",
                        f"companyDocument/company_{account.accountId}.enc",
                        public=False
                    )
                    print("New", new_url)
                    companyModel = CompanyModel(
                        accountId=accountModel.accountId, companyDocUrl=new_url
                    )
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
                accountModel = (
                    session.query(AccountModel)
                    .filter_by(accountId=account.accountId)
                    .first()
                )

                if not accountModel:
                    print(
                        f"No account found with ID: \
                          {account.accountId}"
                    )
                    return False

                # Update base Account fields
                accountModel.name = account.name
                if account.profilePicUrl:
                    accountModel.profilePicUrl = getattr(
                        account, "profilePicUrl", accountModel.profilePicUrl
                    )
                if hasattr(account, "passwordHash") and account.passwordHash != "":
                    accountModel.passwordHash = getattr(account, "passwordHash")

                # Role-specific updates
                if accountModel.role == Role.User:
                    userModel = (
                        session.query(UserModel)
                        .filter_by(accountId=account.accountId)
                        .first()
                    )
                    if userModel:
                        userModel.bio = getattr(account, "bio", userModel.bio)
                        if account.portfolioUrl:
                            userModel.portfolioUrl = getattr(
                                account, "portfolioUrl", userModel.portfolioUrl
                            )

                elif accountModel.role == Role.Company:
                    companyModel = (
                        session.query(CompanyModel)
                        .filter_by(accountId=account.accountId)
                        .first()
                    )
                    if companyModel:
                        companyModel.description = getattr(
                            account, "description", companyModel.description
                        )
                        companyModel.location = getattr(
                            account, "location", companyModel.location
                        )

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
                accountModel = (
                    session.query(AccountModel).filter_by(accountId=accountId).first()
                )

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

    @staticmethod
    def setTwoFa(acc_id: int, secret: str, enabled: bool):
        try:
            with db_context.session_scope() as session:
                account = (
                    session.query(AccountModel).filter_by(accountId=acc_id).first()
                )
                if not account:
                    return False

                account.twoFaEnabled = enabled
                account.twoFaSecret = secret

                session.commit()
                return True

        except Exception as e:
            print(f"Error updating account: {e}")
            traceback.print_exc()
            return False

    @staticmethod
    def getAllCompanies() -> list["CompanyModel"]:
        """
        Retrieves all companies.
        :return: List of all companies.
        """
        with db_context.session_scope() as session:
            companies = session.query(CompanyModel).all()
            return [Company.from_CompanyModel(company) for company in companies]

    @staticmethod
    def setCompanyVerified(company_id: int, verified: int):
        """
        Set the 'verified' status for a company.
        :param company_id: ID of the company to update.
        :param verified: True (1) to verify, False (0) to unverify.
        :return: True if update was successful, False otherwise.
        """
        with db_context.session_scope() as session:
            company = (
                session.query(CompanyModel).filter_by(companyId=company_id).first()
            )
            if not company:
                return False
            company.verified = verified
            return True
