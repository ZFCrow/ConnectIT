from Boundary.Mapper.JobListingMapper import JobListingMapper
from Entity.JobListing import JobListing
from SQLModels.base import db_context  
class JobListingControl:
    def __init__(self):
        """
        Initializes the JobListingControl class.
        This class is responsible for managing job listings.
        """
        # self.db = DatabaseConnection()  # Example: Initialize database connection
        print("JobListingControl initialized")
    @staticmethod
    def addJobListing( job_data:dict):
        """
        Adds a new job listing.
        job_data: dict containing job details.
        """
        jobListing: JobListing = JobListing.from_dict(job_data)
        company_id = job_data.get('company_id')
        sucess=JobListingMapper.addJob(jobListing,company_id)  # Assuming JobListingMapper has an addJob method
        print(f"Adding job listing: {job_data}")
        if sucess:
            return True
        else:
            return False
        
    @staticmethod
    def getAllJobListings():
        """
        Retrieves all job listings.
        """
        # Example: return self.db.query(Job).all()
        print("Retrieving all job listings")
        return JobListingMapper.getAllJobListings()  # Assuming JobListingMapper has a getAllJobListings method
    @staticmethod
    def deleteJob( jobId: int):
        """
        Deletes a job listing by its jobId.
        """
        # Example: job = self.db.query(Job).get(jobId)
        # if job: self.db.delete(job); self.db.commit()'
        success = JobListingMapper.deleteJob(jobId)  # Assuming JobListingMapper has a deleteJob method
        print(f"Deleting job with jobId: {jobId}")

        return success
        # TODO: Replace with actual database logic

    def acceptApplicant(self, applicantId: int, jobId: int):
        """
        Accepts an applicant for a job listing.
        """
        # Example: update applicant/job status in DB
        print(f"Accepting applicant {applicantId} for job {jobId}")
        # TODO: Replace with actual database logic

    def rejectApplicant(self, applicantId: int, jobId: int):
        """
        Rejects an applicant for a job listing.
        """
        print(f"Rejecting applicant {applicantId} for job {jobId}")
        # TODO: Replace with actual database logic
