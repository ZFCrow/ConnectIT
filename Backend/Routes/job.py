# job_listing_routes.py

from flask import Blueprint, request, jsonify, abort
from Security.JWTUtils import JWTUtils
from Control.JobApplicationControl import JobApplicationControl
from Control.JobListingControl import JobListingControl
from Security.Limiter import limiter, get_company_key
from Security.ValidateInputs import validate_job_listing
from Security import SplunkUtils

job_listing_bp = Blueprint("job_listing", __name__)
SplunkLogging = SplunkUtils.SplunkLogger()


def _authenticate():
    """
    Pulls and validates the JWT from the session_token cookie.
    Aborts 401 if missing/invalid.
    """
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401, "Authentication required")
    try:
        return JWTUtils.decode_jwt_token(token)
    except Exception:
        abort(401, "Invalid or expired token")


# GET all job listings
@job_listing_bp.route("/joblistings", methods=["GET"])
def getAllJobListings():
    listings = JobListingControl.getAllJobListings()
    print(f"All job listings: {[listing.to_dict() for listing in listings]}")
    return jsonify([listing.to_dict() for listing in listings]), 200


# GET a single job detail
@job_listing_bp.route("/jobDetails/<int:job_id>", methods=["GET"])
def getJobDetails(job_id):
    listings = JobListingControl.getJobDetails(job_id)
    return (
        jsonify(listings.to_dict()) if listings else jsonify({"error": "Job not found"})
    ), 200


@job_listing_bp.route(
    "/companyJobListings/<int:company_id>",
    methods=["GET"],
)
def getCompanyJobListings(company_id):
    # Pass company_id so you only get jobs for that company
    listings = JobListingControl.getAllJobListings(company_id=company_id)
    print(f"Company job listings: {[listing.to_dict() for listing in listings]}")
    return jsonify([listing.to_dict() for listing in listings]), 200


# POST new job listing
@limiter.limit("15 per hour", key_func=get_company_key)
@job_listing_bp.route("/addJob", methods=["POST"])
def createJobListing():
    claims = _authenticate()
    company_id = claims.get("companyId")

    job_data = request.get_json() or {}
    # 401 if client tries to forge another company’s ID
    if job_data.get("company_id") is not None and job_data["company_id"] != company_id:
        abort(401, description="Unauthorized: company_id does not match token")

    job_data["company_id"] = company_id
    errors = validate_job_listing(job_data)
    if errors:

        SplunkLogging.send_log(
            {
                "event": "Create Job Listing Failed",
                "reason": "Validation error",
                "errors": errors,
                "ip": SplunkLogging.get_real_ip(request),
                "role" : claims.get("role"),
                "company_id": company_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": errors}), 400
    success = JobListingControl.addJobListing(
        job_data=job_data
    )  # implement this in your control
    if success:

        SplunkLogging.send_log(
            {
                "event": "Create Job Listing Success",
                "jobTitle": job_data.get("title"),
                "companyId": job_data.get("company_id"),
                "ip": SplunkLogging.get_real_ip(request),
                "role" : claims.get("role"),
                "company_id": company_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "Job listing created successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Create Job Listing Failed",
                "reason": "Server error",
                "ip": SplunkLogging.get_real_ip(request),
                "role" : claims.get("role"),
                "company_id": company_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to create job listing"}), 500


@job_listing_bp.route("/deleteJob/<int:jobId>", methods=["POST"])
def deleteJobListing(jobId):
    """
    Deletes a job listing by its jobId.
    """
    claims = _authenticate()
    company_id = claims.get("companyId")
    role = claims.get("role")
    is_admin = role == "Admin"
    is_company = role == "Company"

    # only Company users or Admins may proceed
    if not is_admin and not is_company:
        abort(403, "Only company users or admins may delete job listings")
    job = JobListingControl.getJobDetails(jobId)  # returns a JobListing entity
    if not job:
        abort(404, "Job listing not found")
    if not is_admin and job.company.companyId != company_id:
        abort(403, "Cannot delete job listing for another company")
    success = JobListingControl.deleteJob(jobId)

    if success:
        SplunkLogging.send_log(
            {
                "event": "Delete Job Listing Success",
                "jobId": jobId,
                "ip": SplunkLogging.get_real_ip(request),
                "role" : claims.get("role"),
                "company_id": company_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"message": "Job listing deleted successfully!"}), 200
    else:
        SplunkLogging.send_log(
            {
                "event": "Delete Job Listing Fail",
                "jobId": jobId,
                "ip": SplunkLogging.get_real_ip(request),
                "role" : claims.get("role"),
                "company_id": company_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"error": "Failed to delete job listing"}), 200


@job_listing_bp.route("/getFieldOfWork", methods=["GET"])
def getFieldOfWork():
    """
    Retrieves all field of work options.
    """
    return JobApplicationControl.getAllFieldOfWork()


@job_listing_bp.route("/getBookmarkedJob/<int:userId>", methods=["GET"])
def getBookmarkedJobs(userId):
    """
    Retrieves all bookmarked job IDs for a user.
    """
    bookmarked_job_ids = JobListingControl.getBookmarkedJobIds(userId)
    return jsonify(bookmarked_job_ids), 200


@job_listing_bp.route("/addBookmark", methods=["POST"])
def addBookmark():
    """
    Adds a job to the user's bookmarks.
    """
    claims = _authenticate()
    user_id = claims.get("userId")

    data = request.get_json() or {}
    jobId = data.get("jobId")
    if not jobId:
        return jsonify({"error": "Job ID is required"}), 400

    success = JobListingControl.addBookmark(user_id, jobId)
    return (
        jsonify({"message": "Job bookmarked successfully!"})
        if success
        else jsonify({"error": "Failed to bookmark job"})
    ), 200


@job_listing_bp.route("/removeBookmark/<int:userId>/<int:jobId>", methods=["DELETE"])
def removeBookmark(userId, jobId):
    """
    Removes a job from the user's bookmarks.
    """
    claims = _authenticate()
    auth_user = claims.get("userId")
    if userId != auth_user:
        abort(403, "Forbidden: cannot remove another user's bookmark")

    if not userId or not jobId:
        return jsonify({"error": "User ID and Job ID are required"}), 400

    success = JobListingControl.removeBookmark(userId, jobId)
    return (
        jsonify({"message": "Job removed from bookmarks successfully!"})
        if success
        else jsonify({"error": "Failed to remove job from bookmarks"})
    ), 200


@job_listing_bp.route("/getLatestJobListings/<int:companyID>", methods=["GET"])
def getLatestJobListings(companyID):
    """
    Retrieves the latest job listings for a company.
    :param companyID: ID of the company.
    :return: List of latest job listings.
    """
    latestListing = JobListingControl.getLatestJobListings(companyID)
    return jsonify([job.to_dict() for job in latestListing]), 200


@job_listing_bp.route("/getAllViolations", methods=["GET"])
def getAllViolations():
    """
    Retrieves all violations.
    :return: List of all violations.
    """
    return JobListingControl.getAllViolations()


@job_listing_bp.route("/setViolation/<int:jobId>/<int:violationId>", methods=["POST"])
def setViolation(jobId, violationId):
    """
    Sets a violation for a job listing.
    :param jobId: ID of the job to set the violation for.
    :param violationId: ID of the violation to set.
    :return: Success message or error.
    """
    claims = _authenticate()
    role = claims.get("role")
    user_id = claims.get("userId")

    success = JobListingControl.setViolation(jobId, violationId)

    if success:
        SplunkLogging.send_log(
            {
                "event": "Set Violation Success",
                "JobId": jobId,
                "violationId": violationId,
                "ip": SplunkLogging.get_real_ip(request),
                "role": role,
                "userId":user_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "Violation set successfully!"}), 200

    else:
        SplunkLogging.send_log(
            {
                "event": "Set Violation Failed",
                "JobId": jobId,
                "violationId": violationId,
                "ip": SplunkLogging.get_real_ip(request),
                "role": role,
                "userId":user_id,
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to set violation"}), 500
