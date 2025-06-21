# job_listing_routes.py

from flask import Blueprint, request, jsonify
from Boundary.TableDataGateway.FieldOfWorkTDG import FieldOfWorkTDG
from Control.JobApplicationControl import JobApplicationControl
from Control.JobListingControl import JobListingControl  # Import your control class
from Entity.JobListing import JobListing  # Import your entity class 


job_listing_bp = Blueprint("job_listing", __name__)

# GET all job listings
@job_listing_bp.route("/joblistings", methods=["GET"])
def get_all_job_listings():
    listings = JobListingControl.getAllJobListings()  # implement this in your control
    return jsonify([l.to_dict() for l in listings]), 200

# GET a single job detail
@job_listing_bp.route("/jobDetails/<int:job_id>", methods=["GET"])
def get_job_details(job_id):
    listings = JobListingControl.getJobDetails(job_id)  # implement this in your control
    return jsonify(listings.to_dict()) if listings else jsonify({"error": "Job not found"}), 200

@job_listing_bp.route("/companyJobListings/<int:company_id>", methods=["GET"])
def get_company_job_listings(company_id):
    # Pass company_id so you only get jobs for that company
    listings = JobListingControl.getAllJobListings(company_id=company_id)
    print(f"Company job listings: {[l.to_dict() for l in listings]}")
    return jsonify([l.to_dict() for l in listings]), 200

# POST new job listing
@job_listing_bp.route("/addJob", methods=["POST"])
def create_job_listing():
    job_data = request.get_json()
    success = JobListingControl.addJobListing( job_data=job_data)  # implement this in your control
    if success:
        return jsonify({"message": "Job listing created successfully!"}), 201
    else:
        return jsonify({"error": "Failed to create job listing"}), 500

@job_listing_bp.route("/deleteJob/<int:jobId>", methods=["POST"])
def delete_job_listing(jobId):
    """
    Deletes a job listing by its jobId.
    """
    success = JobListingControl.deleteJob(jobId)
    return jsonify({"message": "Job listing deleted successfully!"}) if success else jsonify({"error": "Failed to delete job listing"}), 200

@job_listing_bp.route("/applyJob", methods=["POST"])
def apply_job():
    """
    Applies for a job listing.
    """
    # ── 1️⃣  Figure out which content type we got ───────────────────────
    if request.content_type.startswith("multipart/form-data"):
        # sent from <input type="file">  →  request.form & request.files
        userId = request.form.get("userId", type=int)
        jobId  = request.form.get("jobId",  type=int)
        resumeFile = request.files.get("resume")          # None if not provided
    else:
        # application/json
        payload = request.get_json(silent=True) or {}
        userId = payload.get("userId")
        jobId  = payload.get("jobId")
        resumeFile = None


    if not jobId:
        return jsonify({"error": "Job ID is required"}), 400
    if not userId:
        return jsonify({"error": "User ID is required"}), 400
    
    success = JobApplicationControl.applyJob(jobId, userId, resumeFile)
    if success:
        return jsonify({"message": "Application submitted successfully!"}), 201
    else:
        return jsonify({"error": "Failed to apply for job"}), 500
    
@job_listing_bp.route("/approveApplication/<int:applicationId>", methods=["POST"])
def approve_application(applicationId):
    """
    Approves a job application by applicationId.
    """
    success = JobApplicationControl.approveApplication(applicationId)
    if success:
        return jsonify({"message": "Application submitted successfully!"}), 201
    else:
        return jsonify({"error": "Failed to apply for job"}), 500

@job_listing_bp.route("/rejectApplication/<int:applicationId>", methods=["DELETE"])
def reject_application(applicationId):
    """
    Rejects a job application by applicationId.
    """
    success = JobApplicationControl.rejectApplication(applicationId)
    return jsonify({"message": "Application rejected successfully!"}) if success else jsonify({"error": "Failed to reject application"}), 200

@job_listing_bp.route("/getApplicantsByCompanyId/<int:companyId>", methods=["GET"])
def getApplicantsByCompanyId(companyId):
    """
    Retrieves all job applications submitted to jobs by this company.
    """
    applicants=JobApplicationControl.getApplicationsByCompanyId(companyId)
    return jsonify([applicant.to_dict() for applicant in applicants]) if applicants else jsonify([]), 200

@job_listing_bp.route("/getFieldOfWork", methods=["GET"])
def get_field_of_work():
    """
    Retrieves all field of work options.
    """
    return JobApplicationControl.getAllFieldOfWork()

@job_listing_bp.route("/getBookmarkedJob/<int:userId>", methods=["GET"])
def get_bookmarked_jobs(userId):
    """
    Retrieves all bookmarked job IDs for a user.
    """
    bookmarked_job_ids = JobListingControl.getBookmarkedJobIds(userId)
    return jsonify(bookmarked_job_ids), 200

@job_listing_bp.route("/getAppliedJobId/<int:userId>", methods=["GET"])
def get_applied_jobs(userId):
    """
    Retrieves all applied job IDs for a user.
    """
    applied_job_ids = JobApplicationControl.getAppliedJobIds(userId)
    return jsonify(applied_job_ids), 200

@job_listing_bp.route("/addBookmark", methods=["POST"])
def add_bookmark():
    """
    Adds a job to the user's bookmarks.
    """
    userId = request.json.get("userId")
    jobId = request.json.get("jobId")
    if not userId or not jobId:
        return jsonify({"error": "User ID and Job ID are required"}), 400
    
    success = JobListingControl.addBookmark(userId, jobId)
    return jsonify({"message": "Job bookmarked successfully!"}) if success else jsonify({"error": "Failed to bookmark job"}), 200

@job_listing_bp.route("/removeBookmark/<int:userId>/<int:jobId>", methods=["DELETE"])
def remove_bookmark(userId, jobId):
    """
    Removes a job from the user's bookmarks.
    """
 
    if not userId or not jobId:
        return jsonify({"error": "User ID and Job ID are required"}), 400
    
    success = JobListingControl.removeBookmark(userId, jobId)
    return jsonify({"message": "Job removed from bookmarks successfully!"}) if success else jsonify({"error": "Failed to remove job from bookmarks"}), 200

@job_listing_bp.route("/getLatestAppliedJob/<int:userId>", methods=["GET"]) 
def get_latest_applied_job(userId): 
    """
    Retrieves the latest job listing that the user has applied for.
    :param userId: ID of the user.
    :return: Latest job listing applied by the user.
    """
    latest_job = JobApplicationControl.getLatestAppliedJobs(userId)
    return jsonify([job.to_dict() for job in latest_job]), 200

@job_listing_bp.route("/getLatestJobListings/<int:companyID>", methods=["GET"]) 
def get_latest_job_listings(companyID): 
    """
    Retrieves the latest job listings for a company.
    :param companyID: ID of the company.
    :return: List of latest job listings.
    """
    latestListing = JobListingControl.getLatestJobListings(companyID) 
    return jsonify([job.to_dict() for job in latestListing]), 200 


########################################################################
#######TODO: TO BE MOVED TO ACCOUNT ROUTE AFTER INTEGRATION##########
#########################################################################
@job_listing_bp.route("/getAllCompanies", methods=["GET"])
def get_all_companies():
    """
    Retrieves all companies.
    :return: List of all companies.
    """
    companies = JobListingControl.getAllCompanies()
    return jsonify([company.to_dict() for company in companies]), 200

@job_listing_bp.route("/setCompanyVerified/<int:company_id>/<int:verified>", methods=["POST"])
def set_company_verified(company_id, verified):
    """
    Sets the verification status of a company.
    :param company_id: ID of the company to verify.
    :param verified: Verification status (1 for True, 0 for False).
    :return: Success message or error.
    """
    success = JobListingControl.setCompanyVerified(company_id, bool(verified))
    return jsonify({"message": "Company verification status updated successfully!"}) if success else jsonify({"error": "Failed to update company verification status"}), 200

@job_listing_bp.route("/getAllViolations", methods=["GET"])
def get_all_violations():
    """
    Retrieves all violations.
    :return: List of all violations.
    """
    return JobListingControl.getAllViolations()

@job_listing_bp.route("/setViolation/<int:jobId>/<int:violationId>", methods=["POST"])
def set_violation(jobId, violationId):
    """
    Sets a violation for a job listing.
    :param jobId: ID of the job to set the violation for.
    :param violationId: ID of the violation to set.
    :return: Success message or error.
    """
    success = JobListingControl.setViolation(jobId, violationId)
    return jsonify({"message": "Violation set successfully!"}) if success else jsonify({"error": "Failed to set violation"}), 200
    