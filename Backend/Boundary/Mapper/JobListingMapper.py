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
            fieldOfWork=jobListing.fieldOfWork.value,
            createdAt=jobListing.createdAt,
            workArrangement=jobListing.workArrangement.value,
            isDeleted= jobListing.isDeleted
        )
     
        
        with db_context.session_scope() as session:
            session.add(job_listing_model)
            session.flush()
            ## Add the responsibilities to the job listing
            for responsibility in jobListing.responsibilities:

                responsibility_model = ResponsibilityModel(
                    responsibility=responsibility,
                    jobId=job_listing_model.jobId
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
                    selectinload(JobListingModel.responsibilities),
                    selectinload(JobListingModel.jobApplication).selectinload(JobApplicationModel.user).selectinload(UserModel.account)
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
            return JobListing.from_JobListingModel(job_listing,numApplicants=numApplicants)
    
    @staticmethod
    def getAllJobListings(company_id:int = None) -> list["JobListing"]:
        
        with db_context.session_scope() as session:
            # Build base query
            base_query = (
                session.query(
                    JobListingModel,
                    func.count(JobApplicationModel.applicationId).label("numApplicants")
                )
                .outerjoin(JobApplicationModel, JobListingModel.jobId == JobApplicationModel.jobId)
                .options(selectinload(JobListingModel.company))
                .group_by(JobListingModel.jobId)
            )
            if company_id is not None:
                base_query = base_query.filter(JobListingModel.companyId == company_id)
            orm_results = base_query.all()

            # Each result is (JobListingModel, numApplicants)
            return [
                JobListing.from_JobListingModel(orm, numApplicants)
                for orm, numApplicants in orm_results
            ]
         
    @staticmethod
    def deleteJob(jobId: int) -> bool:
        """
        Deletes a job listing by its jobId.
        """
        with db_context.session_scope() as session:
            job_listing = session.query(JobListingModel).filter_by(jobId=jobId).first()
            if not job_listing:
                return False
            
            session.delete(job_listing)
            return True