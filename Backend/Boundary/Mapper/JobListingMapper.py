from Entity.JobListing import JobListing
from SQLModels.ResponsibilityModel import ResponsibilityModel
from SQLModels.JobListingModel import JobListingModel
from SQLModels.base import db_context

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
                )
                .filter(JobListingModel.jobId == job_id)
                .first()
            )
            if not job_listing:
                return None
            return JobListing.from_JobListingModel(job_listing)
    
    @staticmethod
    def getAllJobListings(company_id:int = None) -> list["JobListing"]:
        
        if(company_id is None):
            """
            Retrieves every job listing with its company + responsibilities.
            """
            with db_context.session_scope() as session:
                orm_list = (
                    session.query(JobListingModel)
                    .options(
                        selectinload(JobListingModel.company),
                    )
                    .all()
                )
                # build pure-python entities while session is open
                return [JobListing.from_JobListingModel(o) for o in orm_list]
            
        else: 
            """
            Retrieves every job listing with its company .
            """  
            with db_context.session_scope() as session:
                orm_list = (
                    session.query(JobListingModel)
                    .options(
                        selectinload(JobListingModel.company),
                    )
                    .filter(JobListingModel.companyId == company_id)
                    .all()
                )
                # build pure-python entities while session is open
                return [JobListing.from_JobListingModel(o) for o in orm_list]
         
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