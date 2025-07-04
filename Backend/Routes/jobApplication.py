# job_application_routes.py

from flask import Blueprint, request, jsonify, abort, send_file
from Control.JobApplicationControl import JobApplicationControl
from Control.JobListingControl import JobListingControl
from Security.JWTUtils import JWTUtils
from Security.Limiter import limiter, get_user_key
from Security.ValidateFiles import enforce_pdf_limits, sanitize_pdf
from Security import SplunkUtils
from Utils.UploadDocUtil import download_by_uri
from Security.FileEncUtils import decrypt_file_gcm
from io import BytesIO
import re

job_application_bp = Blueprint("job_application", __name__)
SplunkLogging = SplunkUtils.SplunkLogger()


def _authenticate():
    token = JWTUtils.get_token_from_cookie()
    if not token:
        abort(401, description="Authentication required")
    try:
        return JWTUtils.decode_jwt_token(token)
    except Exception:
        abort(401, description="Invalid or expired token")


@job_application_bp.route("/applyJob", methods=["POST"])
@limiter.limit("5 per hour", key_func=get_user_key)
def applyJob():
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

                SplunkLogging.send_log(
                    {
                        "event": "Job Application Failed",
                        "reason": "Invalid PDF upload",
                        "error": str(e),
                        "userId": userId,
                        "jobId": jobId,
                        "ip": SplunkLogging.get_real_ip(request),
                        "user_agent": str(request.user_agent),
                        "method": request.method,
                        "path": request.path,
                    }
                )

                return jsonify({"error": str(e)}), 400
    else:
        # application/json
        payload = request.get_json(silent=True) or {}
        userId = payload.get("userId")
        jobId = payload.get("jobId")
        resumeFile = None

    if not jobId:

        SplunkLogging.send_log(
            {
                "event": "Job Application Failed",
                "reason": "Job ID missing",
                "userId": userId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Job ID is required"}), 400

    if not userId:

        SplunkLogging.send_log(
            {
                "event": "Job Application Failed",
                "reason": "User ID missing",
                "jobId": jobId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"error": "User ID is required"}), 400

    success = JobApplicationControl.applyJob(jobId, userId, resumeFile)
    if success:

        SplunkLogging.send_log(
            {
                "event": "Job Applied Success",
                "userId": userId,
                "jobId": jobId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "Application submitted successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Job Application Failed",
                "reason": "Internal error",
                "userId": userId,
                "jobId": jobId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to apply for job"}), 500


@job_application_bp.route("/approveApplication/<int:applicationId>", methods=["POST"])
def approveApplication(applicationId):
    """
    Approves a job application by applicationId.
    """
    claims = _authenticate()
    company_id = claims.get("companyId")
    if company_id is None:
        abort(403, "Only company users may approve applications")

    app_data = JobApplicationControl.getApplicationById(applicationId)
    if not app_data:
        abort(404)
    job_id = app_data["jobId"]

    job = JobListingControl.getJobDetails(job_id)
    if not job:
        abort(404, "Associated job not found")

    if job.company.companyId != company_id:
        abort(403, "Cannot approve an application for another company")

    success = JobApplicationControl.approveApplication(applicationId)
    if success:

        SplunkLogging.send_log(
            {
                "event": "Approve Application Success",
                "applicationId": applicationId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"message": "Application submitted successfully!"}), 201
    else:

        SplunkLogging.send_log(
            {
                "event": "Approve Application Failed",
                "applicationId": applicationId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )

        return jsonify({"error": "Failed to apply for job"}), 500


@job_application_bp.route("/rejectApplication/<int:applicationId>", methods=["DELETE"])
def rejectApplication(applicationId):
    """
    Rejects a job application by applicationId.
    """
    claims = _authenticate()
    company_id = claims.get("companyId")
    if company_id is None:
        abort(403, "Only company users may approve applications")

    app_data = JobApplicationControl.getApplicationById(applicationId)
    if not app_data:
        abort(404)
    job_id = app_data["jobId"]

    job = JobListingControl.getJobDetails(job_id)
    if not job:
        abort(404, "Associated job not found")

    if job.company.companyId != company_id:
        abort(403, "Cannot approve an application for another company")

    success = JobApplicationControl.rejectApplication(applicationId)

    if success:
        SplunkLogging.send_log(
            {
                "event": "Reject Application Success",
                "applicationId": applicationId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"message": "Application rejected successfully!"}), 200
    else:
        SplunkLogging.send_log(
            {
                "event": "Reject Application Failed",
                "applicationId": applicationId,
                "ip": SplunkLogging.get_real_ip(request),
                "user_agent": str(request.user_agent),
                "method": request.method,
                "path": request.path,
            }
        )
        return jsonify({"error": "Failed to reject application"}), 500
    # return (
    #    jsonify({"message": "Application rejected successfully!"})
    #    if success
    #
    #    else jsonify({"error": "Failed to reject application"})
    # ), 200


@job_application_bp.route("/getApplicantsByCompanyId/<int:companyId>", methods=["GET"])
def getApplicantsByCompanyId(companyId):
    """
    Retrieves all job applications submitted to jobs by this company.
    """
    claims = _authenticate()
    my_cid = claims.get("companyId")
    if my_cid is None or my_cid != companyId:
        abort(403, "Cannot view applications for another company")
    applicants = JobApplicationControl.getApplicationsByCompanyId(companyId)

    return (
        jsonify([applicant.to_dict() for applicant in applicants])
        if applicants
        else jsonify([])
    ), 200


@job_application_bp.route("/getAppliedJobId/<int:userId>", methods=["GET"])
def getAppliedJobs(userId):
    """
    Retrieves all applied job IDs for a user.
    """
    applied_job_ids = JobApplicationControl.getAppliedJobIds(userId)
    return jsonify(applied_job_ids), 200


@job_application_bp.route("/getLatestAppliedJob/<int:userId>", methods=["GET"])
def get_latest_applied_job(userId):
    """
    Retrieves the latest job listing that the user has applied for.
    :param userId: ID of the user.
    :return: Latest job listing applied by the user.
    """
    latest_job = JobApplicationControl.getLatestAppliedJobs(userId)
    return jsonify([job.to_dict() for job in latest_job]), 200


@job_application_bp.route("/resume/view", methods=["GET"])
def view_resume():
    claims = _authenticate()
    company_id = claims.get("companyId")
    if company_id is None:
        abort(403, "Only company users may view resumes")
    gs_uri = request.args.get("uri")
    if not gs_uri or not gs_uri.startswith("gs://"):
        abort(400, description="Missing or invalid URI")
    else:
        gs_uri = gs_uri.split("?", 1)[0]

    match = re.search(r"resume/user_(\d+)_job_(\d+)_resume\.enc", gs_uri)
    if not match:
        abort(400, description="Invalid resume filename format")

    user_id, job_id = int(match.group(1)), int(match.group(2))

    try:
        enc_bytes = download_by_uri(gs_uri)
        decrypted = decrypt_file_gcm(BytesIO(enc_bytes))

        return send_file(
            decrypted,
            mimetype="application/pdf",
            as_attachment=False,
            download_name=f"user_{user_id}_job_{job_id}_resume.pdf",
        )
    except (PermissionError, FileNotFoundError, ValueError) as e:
        abort(403, description=str(e))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
