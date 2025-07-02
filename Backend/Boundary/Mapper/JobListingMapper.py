from SQLModels.JobViolationModel import JobViolationModel
from SQLModels.SavedJobModel import SavedJobModel
from SQLModels.FieldOfWorkModel import FieldOfWorkModel
from SQLModels.JobApplicationModel import JobApplicationModel
from SQLModels.UserModel import UserModel
from Entity.JobListing import JobListing
from SQLModels.ResponsibilityModel import ResponsibilityModel
from SQLModels.JobListingModel import JobListingModel
from SQLModels.base import db_context
from sqlalchemy import func

from sqlalchemy.orm import selectinload


class JobListingMapper:
    @staticmethod
    def addJob(jobListing: JobListing, company_id: int):
        """
        Adds a new job listing to the database.
        :param job_data: dict containing job details.
        """
        with db_context.session_scope() as session:

            field: FieldOfWorkModel = (
                session.query(FieldOfWorkModel)
                .filter(
                    func.lower(FieldOfWorkModel.description) == jobListing.fieldOfWork
                )
                .first()
            )

            job_listing_model = JobListingModel(
                # jobId is auto-increment, don't need to set unless updating
                companyId=company_id,
                title=jobListing.title,
                description=jobListing.description,
                applicationDeadline=jobListing.applicationDeadline,
                experiencePreferred=jobListing.experiencePreferred,
                minSalary=jobListing.minSalary,
                maxSalary=jobListing.maxSalary,
                jobType=jobListing.jobType.value,
                fieldOfWorkId=field.fieldOfWorkId,
                createdAt=jobListing.createdAt,
                workArrangement=jobListing.workArrangement.value,
                isDeleted=jobListing.isDeleted,
            )

            session.add(job_listing_model)
            session.flush()

            # Add the responsibilities to the job listing
            for responsibility in jobListing.responsibilities:

                responsibility_model = ResponsibilityModel(
                    responsibility=responsibility, jobId=job_listing_model.jobId
                )
                session.add(responsibility_model)
            return True

    # @staticmethod
    # def getAllJobListings() -> list["JobListing"]:

    @staticmethod
    def getJobDetails(job_id: int) -> "JobListing":
        """
        Retrieves job details by job_id.
        """
        with db_context.session_scope() as session:
            job_listing = (
                session.query(JobListingModel)
                .options(
                    selectinload(JobListingModel.company),
                    selectinload(JobListingModel.fieldOfWork),
                    selectinload(JobListingModel.responsibilities),
                    selectinload(JobListingModel.jobApplication)
                    .selectinload(JobApplicationModel.user)
                    .selectinload(UserModel.account),
                )
                .filter(JobListingModel.jobId == job_id)
                .first()
            )

            if not job_listing:
                return None
            numApplicants = (
                session.query(func.count(JobApplicationModel.applicationId))
                .filter(JobApplicationModel.jobId == job_id)
                .scalar()
            )

            return JobListing.from_JobListingModel(
                job_listing, numApplicants=numApplicants
            )

    @staticmethod
    def getAllJobListings(company_id: int = None) -> list["JobListing"]:
        with db_context.session_scope() as session:
            # Build base query
            base_query = (
                session.query(
                    JobListingModel,
                    func.count(JobApplicationModel.applicationId).label(
                        "numApplicants"
                    ),
                )
                .outerjoin(
                    JobApplicationModel,
                    JobListingModel.jobId == JobApplicationModel.jobId,
                )
                .options(
                    selectinload(JobListingModel.company),
                    selectinload(JobListingModel.fieldOfWork),
                )
                .group_by(JobListingModel.jobId)
                .filter(JobListingModel.isDeleted == 0)
            )
            if company_id is not None:
                base_query = base_query.filter(JobListingModel.companyId == company_id)
            orm_results = base_query.all()

            # Each result is (JobListingModel, numApplicants)
            return [
                JobListing.from_JobListingModel(orm, numApplicants=numApplicants)
                for orm, numApplicants in orm_results
            ]

    @staticmethod
    def deleteJob(jobId: int) -> bool:
        """
        Soft-deletes a job listing by setting isDeleted=1.
        """
        with db_context.session_scope() as session:
            job_listing = session.query(JobListingModel).filter_by(jobId=jobId).first()
            if not job_listing:
                return False

            job_listing.isDeleted = 1  # Mark as deleted
            # No need for session.delete, just update and commit on exit
            return True

    @staticmethod
    def getBookmarkedJobIds(userId: int) -> list[int]:
        """
        Retrieves all bookmarked job IDs for a user.
        :param userId: ID of the user to retrieve bookmarked job IDs for.
        :return: List of bookmarked job IDs.
        """
        with db_context.session_scope() as session:
            job_ids = (
                session.query(SavedJobModel.jobListingId).filter_by(userId=userId).all()
            )
            # job_ids is a list of one-tuples, so flatten it
            return [jid[0] for jid in job_ids]

    @staticmethod
    def addBookmark(userId: int, jobId: int) -> bool:
        """
        Adds a job to the user's bookmarks.
        :param userId: ID of the user.
        :param jobId: ID of the job to bookmark.
        :return: True if bookmark was added successfully, False otherwise.
        """
        with db_context.session_scope() as session:
            existing_bookmark = (
                session.query(SavedJobModel)
                .filter_by(userId=userId, jobListingId=jobId)
                .first()
            )
            if existing_bookmark:
                return False  # Already bookmarked

            new_bookmark = SavedJobModel(userId=userId, jobListingId=jobId)
            session.add(new_bookmark)
            return True

    @staticmethod
    def removeBookmark(userId: int, jobId: int) -> bool:
        """
        Removes a job from the user's bookmarks.
        :param userId: ID of the user.
        :param jobId: ID of the job to remove from bookmarks.
        :return: True if bookmark was removed successfully, False otherwise.
        """
        with db_context.session_scope() as session:
            bookmark = (
                session.query(SavedJobModel)
                .filter_by(userId=userId, jobListingId=jobId)
                .first()
            )
            if not bookmark:
                return False  # Not bookmarked

            session.delete(bookmark)
            return True

    @staticmethod
    def setViolation(jobId: int, violationId: int) -> bool:
        """
        Sets a violation for a job listing.
        :param jobId: ID of the job to set the violation for.
        :param violationId: ID of the violation to set.
        :return: True if the violation was set successfully, False otherwise.
        """
        with db_context.session_scope() as session:
            link = JobViolationModel(jobId=jobId, violationId=violationId)
            session.add(link)
            return True

    @staticmethod
    def getLatestJobListingsByCompany(
        company_id: int, limit: int = 5
    ) -> list["JobListing"]:
        """
        Retrieves the latest job listings for a specific company.
        :param company_id: ID of the
        """
        with db_context.session_scope() as session:
            job_listings = (
                session.query(JobListingModel)
                .filter(
                    JobListingModel.companyId == company_id,
                    JobListingModel.isDeleted == 0,
                )
                .order_by(JobListingModel.createdAt.desc())
                .limit(limit)
                .all()
            )
            return [JobListing.from_JobListingModel(job) for job in job_listings]
