from datetime import datetime
from Entity.JobApplication import Status
from SQLModels.JobApplicationModel import JobApplicationModel
from SQLModels.base import db_context

class JobApplicationMapper:
    @staticmethod
    def applyJob(jobId: int, userId: int):
        """
        Applies for a job by jobId.
        :param jobId: ID of the job to apply for.
        :param userId: ID of the user applying for the job.
        """
        with db_context.session_scope() as session:
            # Assuming JobApplicationModel is defined and has the necessary fields
            application = JobApplicationModel(jobId=jobId, userId=userId, resumeURL="https://www.example.com/", status=Status.APPLIED, appliedAt=datetime.now() )
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
                application.status = Status.Approved  # Assuming Status is an enum with Approved value
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
                application.status = Status.Rejected  # Assuming Status is an enum with Rejected value
                session.commit()
                return True
            return False