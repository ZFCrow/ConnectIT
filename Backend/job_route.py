# job_listing_routes.py

from flask import Blueprint, request, jsonify
from Control.JobApplicationControl import JobApplicationControl
from Control.JobListingControl import JobListingControl  # Import your control class

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

@job_listing_bp.route("/deleteJob/<int:jobId>", methods=["DELETE"])
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
    userId = request.json.get("userId")
    jobId = request.json.get("jobId")
    if not jobId:
        return jsonify({"error": "Job ID is required"}), 400
    if not userId:
        return jsonify({"error": "User ID is required"}), 400
    
    success = JobApplicationControl.applyJob(jobId, userId)
    return jsonify({"message": "Application submitted successfully!"}) if success else jsonify({"error": "Failed to apply for job"}), 200
@job_listing_bp.route("/approveApplication/<int:applicationId>", methods=["POST"])
def approve_application(applicationId):
    """
    Approves a job application by applicationId.
    """
    success = JobApplicationControl.approveApplication(applicationId)
    return jsonify({"message": "Application approved successfully!"}) if success else jsonify({"error": "Failed to approve application"}), 200

@job_listing_bp.route("/rejectApplication/<int:applicationId>", methods=["DELETE"])
def reject_application(applicationId):
    """
    Rejects a job application by applicationId.
    """
    success = JobApplicationControl.rejectApplication(applicationId)
    return jsonify({"message": "Application rejected successfully!"}) if success else jsonify({"error": "Failed to reject application"}), 200

@job_listing_bp.route("/getApplicantsByCompanyId/<int:companyId>", methods=["POST"])
def getApplicantsByCompanyId(companyId):
    """
    Approves a job application by applicationId.
    """
    applicants=JobApplicationControl.getApplicationsByCompanyId(companyId)
    return jsonify([applicant.to_dict() for applicant in applicants]) if applicants else jsonify({"error": "No applicants found"}), 200