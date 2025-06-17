from Boundary.Mapper.JobApplicationMapper import JobApplicationMapper
from Entity.JobListing import JobListing
from SQLModels.base import db_context  

class JobApplicationControl:
    def __init__(self):
        """
        Initializes the JobListingControl class.
        This class is responsible for managing job listings.
        """
        # self.db = DatabaseConnection()  # Example: Initialize database connection
        print("JobListingControl initialized")

    @staticmethod
    def applyJob(jobId: int, userId: int):
        """
        Applies for a job by jobId.
        :param jobId: ID of the job to apply for.
        :param userId: ID of the user applying for the job.
        """
        print(f"Applying for job with jobId: {jobId} by userId: {userId}")
        return JobApplicationMapper.applyJob(jobId, userId)