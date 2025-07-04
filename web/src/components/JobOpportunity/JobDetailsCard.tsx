import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FrontendJobListing, JobListing } from "../../type/jobListing";
import {
  Calendar,
  Bookmark,
  Trash2,
  Edit2,
  User2,
  BookmarkCheck,
} from "lucide-react";
import {
  dateLocale,
  dateFormatOptions,
  //   applicationRoute,
} from "./SharedConfig";
import ResumeUploadModal from "./ResumeUploadModal";
import { useState } from "react";
import ApplicantCard from "./ApplicantCard";
import type { JobApplication } from "../../type/JobApplicationSchema";
import { Role, useAuth } from "@/contexts/AuthContext";
import { useDeleteJob } from "@/utility/handleDeleteJob";
import DeleteJobModal from "./DeleteJobModal";
import { useApplicantActions } from "@/utility/handleApplication";
import { handleBookmarkToggle } from "@/utility/handleBookmark";
import { ViolationOption } from "@/utility/fetchViolationOptions";
import { useApplyJob } from "@/utility/handleApplyJob";
interface Props {
  job: FrontendJobListing;
  userType?: string; // Optional, if needed for user-specific logic
  setJob: React.Dispatch<React.SetStateAction<FrontendJobListing | null>>; // For updating job state after deletion
  violationOptions: ViolationOption[]; // pass in list of {violationId, description}
}
const JobDetailsCard: React.FC<Props> = ({
  job,
  userType,
  setJob,
  violationOptions,
}) => {
  //for application modal
  const [open, setOpen] = useState(false);
  //for delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const { deleteJob, loading } = useDeleteJob(() => {
    setDeleteOpen(false);
    if (userType === Role.Company) navigate("/company/recruitmentDashboard");
    else navigate("/jobListing");

    window.location.reload();
  });
  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteConfirm = (violationId?: number) => {
    deleteJob(job.jobId, violationId);
  };
  const { role, userId, companyId } = useAuth();
  const { applyJob, applicationLoading } = useApplyJob({
    onSuccess: () => {
      setJob((prev) =>
        prev && prev.jobId === job.jobId
          ? {
              ...prev,
              isApplied: true,
              numApplicants: (prev.numApplicants || 0) + 1,
            }
          : prev
      );
      setOpen(false);
    },
  });
  const handleResumeSubmit = (file: File) => {
    // Pass jobId and userId to applyJob
    applyJob(job.jobId, userId, file);
    // Optionally close the modal here or on success
  };
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const statusOptions = ["All", "Applied", "Accepted", "Rejected"];
  // 1️⃣ Make a local copy of applicants so we can update them
  const [localApplicants, setLocalApplicants] = useState<JobApplication[]>([]);
  const { acceptLoadingId, rejectLoadingId, handleAccept, handleReject } =
    useApplicantActions(setLocalApplicants);
  useEffect(() => {
    setLocalApplicants(job.jobApplication ?? []);
  }, [job.jobApplication]);
  const applicants = (localApplicants ?? []).map((app) => ({
    ...app,
    jobTitle: job.title,
    jobId: job.jobId,
  }));

  const filteredApplicantsByStatus = applicants.filter(
    (a) => statusFilter === "All" || a.status === statusFilter
  );
  if (role === Role.Company && job.company.companyId !== companyId)
    return (
      <div className="text-center text-red-500 font-semibold py-8">
        You do not have access to view this job details.
      </div>
    );
  else
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-6">
        {/* Resume Upload Modal */}
        <ResumeUploadModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={handleResumeSubmit}
          jobTitle={job.title}
          companyName={job.company.name}
          loading={applicationLoading}
        />
        {/* Header: Title + Field badge + Bookmark + Posted On */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                {job.title}
              </h1>
              {userType === Role.User ? (
                <span
                  onClick={() =>
                    handleBookmarkToggle(
                      userId,
                      job.jobId,
                      job.isBookmarked,
                      setJob
                    )
                  }
                >
                  {userType === Role.User ? (
                    job.isBookmarked ? (
                      // console.log("Job is bookmarked:", job.isBookmarked),
                      <BookmarkCheck className="w-6 h-6 text-green-500" />
                    ) : (
                      <Bookmark className="w-6 h-6 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition" />
                    )
                  ) : null}
                </span>
              ) : (userType === Role.Company &&
                  job.company.companyId === companyId) ||
                userType === Role.Admin ? (
                <>
                  {/* <Link
                  to={`/company/jobForm/${job.jobId}`}
                  className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
                >
                  <Edit2 className="w-6 h-6" />
                </Link> */}

                  <button
                    aria-label="Delete job"
                    onClick={() => {
                      handleDeleteClick();
                    }}
                    className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <DeleteJobModal
                    open={deleteOpen}
                    onCancel={() => setDeleteOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    loading={loading}
                    jobTitle={job.title}
                    role={userType as Role}
                    violationOptions={violationOptions}
                  />
                </>
              ) : null}
              <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-md">
                <User2 className="w-5 h-5 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">
                  {job.numApplicants || 0} application(s)
                </span>
              </div>
            </div>
            {/* Field badge */}
            <span
              className="
            inline-block
            bg-indigo-600 text-white text-xs font-semibold
            uppercase tracking-wide
            px-2 py-0.5 rounded
          "
            >
              {job.fieldOfWork}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Calendar className="w-5 h-5 text-gray-400" />
            <time dateTime={job.createdAt}>
              Posted on {new Date(job.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>{" "}
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <Link
            to={`/profile/${job.company.accountId}`}
            className=" hover:underline flex items-center"
          >
            <b className="text-gray-400 mr-1">Company:</b>
            {job.company.name}
          </Link>
          {job.company.location && (
            <span>
              <b className="text-gray-400">Location: </b>
              {job.company.location}
            </span>
          )}
          <span>
            <b className="text-gray-400">Type:</b> {job.jobType}
          </span>
          <span>
            <b className="text-gray-400">Work Arr.:</b> {job.workArrangement}
          </span>
          <span>
            <b className="text-gray-400">Salary:</b> $
            {job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}
          </span>
          {typeof job.experiencePreferred === "number" &&
            job.experiencePreferred > 0 && (
              <span className="flex items-center gap-1">
                <span>
                  <b className="text-gray-400">Experience Preferred:</b>{" "}
                  {`${job.experiencePreferred} year(s)`}
                </span>
              </span>
            )}
          {/* <span>
          <b className="text-gray-400">Location: </b>
          {job.company.location}
        </span> */}
        </div>
        <h2 className="text-xl font-semibold text-gray-200">Job Description</h2>
        <p className="text-gray-200 whitespace-pre-line">{job.description}</p>
        {job.responsibilities?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-200">
              Roles and Responsibility
            </h2>
            <ul className="list-disc pl-6 text-gray-200">
              {job.responsibilities?.map((role, index) => (
                <li key={index} className="mb-2">
                  {role}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-6 flex items-center space-x-4">
          {userType === Role.User &&
            (job.isApplied ? (
              /* Already applied ─ outline, disabled */
              <button
                type="button"
                disabled
                className="
        border border-gray-500 text-gray-400
        font-medium px-6 py-2 rounded-xl
        cursor-not-allowed select-none
      "
              >
                Applied
              </button>
            ) : (
              /* Not applied ─ normal green link */
              <Link
                to="" // keep your “open modal” behaviour
                onClick={() => setOpen(true)}
                className="
        bg-green-500 hover:bg-green-600 text-white font-medium
        px-6 py-2 rounded-xl transition
      "
              >
                Apply Now
              </Link>
            ))}

          <div className="inline-flex items-center space-x-1 bg-zinc-800 text-gray-300 text-sm font-medium px-2.5 py-1 rounded-lg">
            <Calendar className="w-4 h-4" />
            <time dateTime={job.applicationDeadline}>
              by{" "}
              {new Date(job.applicationDeadline).toLocaleDateString(
                dateLocale,
                dateFormatOptions
              )}
            </time>
          </div>
        </div>
        {userType === Role.Company && job.numApplicants != 0 && (
          <section className="mt-8">
            <hr className="mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Applicants
              </h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-gray-100 rounded px-3 py-1 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>{" "}
            <ul className="space-y-5">
              {filteredApplicantsByStatus.map((app) => (
                <ApplicantCard
                  key={app.applicationId} // ← make sure it's applicationId!
                  applicant={app}
                  acceptLoading={acceptLoadingId === app.applicationId}
                  rejectLoading={rejectLoadingId === app.applicationId}
                  onAccept={() => handleAccept(app.applicationId)}
                  onDelete={() => handleReject(app.applicationId)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    );
};

export default JobDetailsCard;
