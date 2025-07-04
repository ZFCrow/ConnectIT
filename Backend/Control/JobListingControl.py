from Boundary.TableDataGateway.ViolationGateway import ViolationGateway
from Boundary.Mapper.JobListingMapper import JobListingMapper
from Entity.JobListing import JobListing


class JobListingControl:
    def __init__(self):
        """
        Initializes the JobListingControl class.
        This class is responsible for managing job listings.
        """
        # self.db = DatabaseConnection()
        # # Example: Initialize database connection
        print("JobListingControl initialized")

    @staticmethod
    def addJobListing(job_data: dict):
        """
        Adds a new job listing.
        job_data: dict containing job details.
        """
        jobListing: JobListing = JobListing.from_dict(job_data)
        company_id = job_data.get("company_id")
        sucess = JobListingMapper.addJob(jobListing, company_id)
        if sucess:
            return True
        else:
            return False

    @staticmethod
    def getJobDetails(job_id):
        """
        Retrieves job details by job_id.
        """
        # Example: return self.db.query(Job).filter_by(job_id=job_id).first()
        print(f"Retrieving job details for job_id: {job_id}")
        return JobListingMapper.getJobDetails(job_id)

    @staticmethod
    def getAllJobListings(company_id: int = None):
        """
        Retrieves all job listings.
        """
        if company_id is None:
            print("Retrieving all job listings")
            # Assuming JobListingMapper has a getAllJobListings method
            return JobListingMapper.getAllJobListings()
        else:
            print("Retrieving all job listings")
            return JobListingMapper.getAllJobListings(company_id)

    @staticmethod
    def deleteJob(jobId: int):
        """
        Deletes a job listing by its jobId.
        """
        # Example: job = self.db.query(Job).get(jobId)
        # if job: self.db.delete(job); self.db.commit()'
        success = JobListingMapper.deleteJob(jobId)
        print(f"Deleting job with jobId: {jobId}")

        return success
        # TODO: Replace with actual database logic

    @staticmethod
    def getBookmarkedJobIds(userId: int):
        """
        Retrieves all bookmarked job IDs for a user.
        """
        print(f"Retrieving bookmarked job IDs for userId: {userId}")
        return JobListingMapper.getBookmarkedJobIds(userId)

    @staticmethod
    def addBookmark(userId: int, jobId: int):
        """
        Adds a job to the user's bookmarks.
        """
        print(f"Adding jobId {jobId} to bookmarks for userId {userId}")
        return JobListingMapper.addBookmark(userId, jobId)

    @staticmethod
    def removeBookmark(userId: int, jobId: int):
        """
        Removes a job from the user's bookmarks.
        """
        print(f"Removing jobId {jobId} from bookmarks for userId {userId}")
        return JobListingMapper.removeBookmark(userId, jobId)

    @staticmethod
    def getLatestJobListings(companyID, limit: int = 5):
        """
        Retrieves the latest job listings.
        :param limit: Number of latest job listings to retrieve.
        :return: List of latest job listings.
        """
        print(f"Retrieving latest {limit} job listings")
        return JobListingMapper.getLatestJobListingsByCompany(companyID, limit)

    @staticmethod
    def getAllViolations():
        """
        Retrieves all violations.
        :return: List of all violations.
        """
        print("Retrieving all violations")
        # Assuming JobListingMapper has a getAllViolations method
        return ViolationGateway.getAllViolationOptions()

    @staticmethod
    def setViolation(jobId: int, violationId: int) -> bool:
        """
        Sets a violation for a job listing.
        :param jobId: ID of the job to set the violation for.
        :param violationId: ID of the violation to set.
        :return: True if the violation was set successfully, False otherwise.
        """
        print(f"Setting violation {violationId} for jobId {jobId}")
        return JobListingMapper.setViolation(jobId, violationId)
