from Utils.UploadDocUtil import upload_to_path
from Boundary.TableDataGateway.FieldOfWorkTDG import FieldOfWorkTDG
from Boundary.Mapper.JobApplicationMapper import JobApplicationMapper
from Entity.JobApplication import JobApplication
from Security import FileEncUtils


class JobApplicationControl:
    def __init__(self):
        """
        Initializes the JobListingControl class.
        This class is responsible for managing job listings.
        """
        # self.db = DatabaseConnection()
        # # Example: Initialize database connection
        print("JobListingControl initialized")

    @staticmethod
    def approveApplication(applicationId: int):
        """
        Approves a job application by applicationId.
        :param applicationId: ID of the application to approve.
        """
        print(f"Approving application with applicationId: {applicationId}")
        return JobApplicationMapper.approveApplication(applicationId)

    @staticmethod
    def rejectApplication(applicationId: int):
        """
        Rejects a job application by applicationId.
        :param applicationId: ID of the application to reject.
        """
        print(f"Rejecting application with applicationId: {applicationId}")
        return JobApplicationMapper.rejectApplication(applicationId)

    @staticmethod
    def applyJob(jobId: int, userId: int, resumeFile=None):
        """
        Applies for a job by jobId.
        :param jobId: ID of the job to apply for.
        :param userId: ID of the user applying for the job.
        """
        resume_url = None
        if resumeFile:
            # Choose a deterministic storage name (e.g. userID_jobID.pdf)
            encrypted_file = FileEncUtils.encrypt_file_gcm(resumeFile)
            dest_name = f"resume/user_{userId}_job_{jobId}_resume.enc"
            resume_url = upload_to_path(
                encrypted_file, target_path=dest_name, public=False
            )
            print("Resume uploaded to:", resume_url)
        print(f"Applying for job with jobId: {jobId} by userId: {userId}")
        return JobApplicationMapper.applyJob(jobId, userId, resumeURL=resume_url)

    @staticmethod
    def getApplicationsByCompanyId(companyId: int):
        """
        Retrieves all applications for jobs that belong to the given company.
        :param companyId: ID of the company to retrieve applications for.
        :return: List of JobApplicationModel instances.
        """
        print(
            f"Retrieving applications for \
            company with companyId: {companyId}"
        )
        return JobApplicationMapper.getApplicationsByCompanyId(companyId)

    @staticmethod
    def getAppliedJobIds(userId: int):
        """
        Retrieves all job applications submitted by a user.
        :param userId: ID of the user to retrieve applications for.
        :return: List of JobApplicationModel instances.
        """
        print(f"Retrieving applications for user with userId: {userId}")
        return JobApplicationMapper.getAppliedJobIds(userId)

    @staticmethod
    def getAllFieldOfWork():
        """
        Retrieves all field of work options.
        :return: List of field of work options.
        """
        print("Retrieving all field of work options")
        return FieldOfWorkTDG.getAllFieldOfWork()

    @staticmethod
    def getLatestAppliedJobs(userId: int) -> list[JobApplication]:
        """
        Retrieves the latest job listing that the user has applied for.
        :param userId: ID of the user to retrieve the latest applied job for.
        :return: JobListing instance representing the latest applied job.
        """
        print(f"Retrieving latest applied job for user with userId: {userId}")
        return JobApplicationMapper.getLatestAppliedJobs(userId)

    @staticmethod
    def getApplicationById(applicationId: int):
        """
        Business‐logic wrapper for fetching one application.
        """
        print(f"Retrieving application with applicationId: {applicationId}")
        return JobApplicationMapper.getApplicationById(applicationId)
