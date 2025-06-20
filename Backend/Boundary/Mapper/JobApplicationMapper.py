from datetime import datetime
import logging
from Entity.JobListing import JobListing
from SQLModels.UserModel import UserModel
from SQLModels.JobListingModel import JobListingModel
from Entity.JobApplication import JobApplication, Status
from SQLModels.JobApplicationModel import JobApplicationModel
from SQLModels.base import db_context
from sqlalchemy.orm import selectinload

class JobApplicationMapper:
    @staticmethod
    def applyJob(jobId: int, userId: int, resumeURL: str = None):
        """
        Applies for a job by jobId.
        :param jobId: ID of the job to apply for.
        :param userId: ID of the user applying for the job.
        """
        with db_context.session_scope() as session:
            # Assuming JobApplicationModel is defined and has the necessary fields
            application = JobApplicationModel(jobId=jobId, userId=userId, resumeURL=resumeURL, status=Status.APPLIED, appliedAt=datetime.now() )
            session.add(application)
            session.commit()
            return True
        return False   
    
    @staticmethod
    def approveApplication(applicationId: int):
        """
        Approves a job application by applicationId.
        :param applicationId: ID of the application to approve.
        """
        with db_context.session_scope() as session:
            application = session.query(JobApplicationModel).filter(JobApplicationModel.applicationId == applicationId).first()
            if application:
                application.status = Status.ACCEPTED  # Assuming Status is an enum with Approved value
                session.commit()
                return True
            return False
        
    @staticmethod
    def rejectApplication(applicationId: int):
        """
        Rejects a job application by applicationId.
        :param applicationId: ID of the application to reject.
        """
        with db_context.session_scope() as session:
            application = session.query(JobApplicationModel).filter(JobApplicationModel.applicationId == applicationId).first()
            if application:
                application.status = Status.REJECTED  # Assuming Status is an enum with Rejected value
                session.commit()
                return True
            return False
        
    @staticmethod
    def getApplicationsByCompanyId(companyId: int):
        """
        Retrieves all applications for jobs that belong to the given company.
        :param companyId: ID of the company to retrieve applications for.
        :return: List of JobApplicationModel instances.
        """
        with db_context.session_scope() as session:
            # 1. Get all job IDs belonging to this company
            job_ids = session.query(JobListingModel.jobId).filter(
                JobListingModel.companyId == companyId
            ).all()
            # job_ids is a list of 1-tuples: [(1,), (2,), ...], so flatten:
            job_ids = [jid for (jid,) in job_ids]
            if not job_ids:
                return []
            print(f"Retrieved {len(job_ids)} job IDs for company {companyId}: {job_ids}")
            # 2. Get all applications where jobId is in that list
            applications = session.query(JobApplicationModel).options(selectinload(JobApplicationModel.user).selectinload(UserModel.account)).filter(
                JobApplicationModel.jobId.in_(job_ids)
            ).all()
            print(f"Retrieved {len(applications)} applications for company {companyId} with job IDs {job_ids}")
            print(f"Applications: {applications}")
            return [JobApplication.from_model(a) for a in applications]
    
    @staticmethod
    def getAppliedJobIds(userId: int) -> list[int]:
        """
        Retrieves all job IDs that the user has applied for.
        :param userId: ID of the user.
        :return: List of job IDs.
        """
        with db_context.session_scope() as session:
            job_ids = (
                session.query(JobApplicationModel.jobId)
                .filter(JobApplicationModel.userId == userId)
                .distinct()
                .all()
            )
            # job_ids will be a list of one-tuples: [(id1,), (id2,), ...]
            return [jid[0] for jid in job_ids]
