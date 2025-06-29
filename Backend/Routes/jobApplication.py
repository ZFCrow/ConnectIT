# job_application_routes.py

from flask import Blueprint, request, jsonify
from Control.JobApplicationControl import JobApplicationControl
from Security.Limiter import limiter, get_user_key
from Security.ValidateFiles import enforce_pdf_limits, sanitize_pdf
from Security import SplunkUtils

job_application_bp = Blueprint("job_application", __name__)
SplunkLogging = SplunkUtils.SplunkLogger()


@job_application_bp.route("/applyJob", methods=["POST"])
@limiter.limit("5 per hour", key_func=get_user_key)
def apply_job():
    """
    Applies for a job listing.
    """
    # ── 1️⃣  Figure out which content type we got ───────────────────────
    if request.content_type.startswith("multipart/form-data"):
        # sent from <input type="file">  →  request.form & request.files
        userId = request.form.get("userId", type=int)
        jobId = request.form.get("jobId", type=int)
        resumeFile = request.files.get("resume")  # None if not provided
        if resumeFile:
            try:
                enforce_pdf_limits(resumeFile)
                resumeFile = sanitize_pdf(resumeFile)
            except ValueError as e:

                SplunkLogging.send_log({
                    "event": "Job Application Failed",
                    "reason": "Invalid PDF upload",
                    "error": str(e),
                    "userId": userId,
                    "jobId": jobId,
                    "ip": request.remote_addr,
                    "user_agent": str(request.user_agent),
                    "method": request.method,
                    "path": request.path
                })

                return jsonify({"error": str(e)}), 400
    else:
        # application/json
        payload = request.get_json(silent=True) or {}
        userId = payload.get("userId")
        jobId = payload.get("jobId")
        resumeFile = None

    if not jobId:

        SplunkLogging.send_log({
            "event": "Job Application Failed",
            "reason": "Job ID missing",
            "userId": userId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "Job ID is required"}), 400

    if not userId:

        SplunkLogging.send_log({
            "event": "Job Application Failed",
            "reason": "User ID missing",
            "jobId": jobId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "User ID is required"}), 400

    success = JobApplicationControl.applyJob(jobId, userId, resumeFile)
    if success:

        SplunkLogging.send_log({
            "event": "Job Applied Success",
            "userId": userId,
            "jobId": jobId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"message": "Application submitted successfully!"}), 201
    else:

        SplunkLogging.send_log({
            "event": "Job Application Failed",
            "reason": "Internal error",
            "userId": userId,
            "jobId": jobId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "Failed to apply for job"}), 500


@job_application_bp.route(
        "/approveApplication/<int:applicationId>",
        methods=["POST"]
        )
def approve_application(applicationId):
    """
    Approves a job application by applicationId.
    """
    success = JobApplicationControl.approveApplication(applicationId)
    if success:

        SplunkLogging.send_log({
            "event": "Approve Application Success",
            "applicationId": applicationId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"message": "Application submitted successfully!"}), 201
    else:

        SplunkLogging.send_log({
            "event": "Approve Application Failed",
            "applicationId": applicationId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })

        return jsonify({"error": "Failed to apply for job"}), 500


@job_application_bp.route(
        "/rejectApplication/<int:applicationId>",
        methods=["DELETE"]
        )
def reject_application(applicationId):
    """
    Rejects a job application by applicationId.
    """
    success = JobApplicationControl.rejectApplication(applicationId)

    if success:
        SplunkLogging.send_log({
            "event": "Reject Application success",
            "applicationId": applicationId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })
        return jsonify({"message": "Application rejected successfully!"}), 200
    else:
        SplunkLogging.send_log({
            "event": "Reject Application Failed",
            "applicationId": applicationId,
            "ip": request.remote_addr,
            "user_agent": str(request.user_agent),
            "method": request.method,
            "path": request.path
        })
        return jsonify({"error": "Failed to reject application"}), 500
    # return (
    #    jsonify({"message": "Application rejected successfully!"})
    #    if success
    #
    #    else jsonify({"error": "Failed to reject application"})
    # ), 200


@job_application_bp.route(
        "/getApplicantsByCompanyId/<int:companyId>",
        methods=["GET"]
    )
def getApplicantsByCompanyId(companyId):
    """
    Retrieves all job applications submitted to jobs by this company.
    """
    applicants = JobApplicationControl.getApplicationsByCompanyId(companyId)

    return (
        jsonify([applicant.to_dict() for applicant in applicants])
        if applicants
        else jsonify([])
    ), 200


@job_application_bp.route("/getAppliedJobId/<int:userId>", methods=["GET"])
def get_applied_jobs(userId):
    """
    Retrieves all applied job IDs for a user.
    """
    applied_job_ids = JobApplicationControl.getAppliedJobIds(userId)
    return jsonify(applied_job_ids), 200
