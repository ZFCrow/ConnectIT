// src/components/JobListing/JobCard.tsx
import React from "react";
import {
  Briefcase,
  Calendar,
  Laptop,
  Shuffle,
  BuildingIcon,
  DollarSign,
  Bookmark,
  User,
  BookmarkCheck,
  Trash2,
  User2,
} from "lucide-react";
import type { FrontendJobListing, JobListing } from "../../type/jobListing";
import { Link, useNavigate } from "react-router-dom";
import { dateLocale, dateFormatOptions } from "./SharedConfig";
import { useState } from "react";
import ResumeUploadModal from "./ResumeUploadModal";
import { Role } from "@/contexts/AuthContext";
import DeleteJobModal from "./DeleteJobModal";
import { useDeleteJob } from "@/utility/handleDeleteJob";
import { useApplyJob } from "@/utility/handleApplyJob";
import { useAuth } from "@/contexts/AuthContext";
import { handleBookmarkToggle } from "@/utility/handleBookmark";
import { ViolationOption } from "@/utility/fetchViolationOptions";

type Props = {
  job: FrontendJobListing;
  userType: string;
  setJobListings: React.Dispatch<React.SetStateAction<JobListing[]>>;
  violationOptions: ViolationOption[]; // pass in list of {violationId, description}
};

const JobCard: React.FC<Props> = ({
  job,
  userType,
  setJobListings,
  violationOptions,
}) => {
  const navigate = useNavigate();
  const posted = new Date(job.createdAt).toLocaleDateString(
    dateLocale,
    dateFormatOptions
  );
  const [open, setOpen] = useState(false);
  const { applyJob, applicationLoading } = useApplyJob({
    onSuccess: () => {
      setJobListings((prev) =>
        prev.map((j) =>
          j.jobId === job.jobId
            ? {
                ...j,
                isApplied: true,
                numApplicants: (j.numApplicants || 0) + 1,
              }
            : j
        )
      );
      setOpen(false);
    },
  });
  const handleResumeSubmit = (file: File) => {
    // Pass jobId and userId to applyJob
    applyJob(job.jobId, userId, file);
    // Optionally close the modal here or on success
  };
  const { userId } = useAuth(); // Get userId from context/auth
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteJob, loading } = useDeleteJob(() => {
    setDeleteOpen(false);
    setJobListings((prev) => prev.filter((j) => j.jobId !== job.jobId));
  });

  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteConfirm = (violationId?: number) => {
    deleteJob(job.jobId, violationId);
  };

  return (
    <div
      className="
        bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg transition
        grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-6 gap-y-4
      "
    >
      {/* Title + Applicant Count + Actions */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-white leading-tight">
            {userType === Role.Company || userType === Role.Admin ? (
              <span className="text-gray-400">#{job.jobId}</span>
            ) : (
              <></>
            )}{" "}
            {job.title}
          </h2>
          <span
            onClick={() =>
              handleBookmarkToggle(
                userId,
                job.jobId,
                job.isBookmarked,
                setJobListings
              )
            }
          >
            {userType === Role.User &&
              (job.isBookmarked ? (
                <BookmarkCheck className="w-6 h-6 text-green-500" />
              ) : (
                <Bookmark className="w-6 h-6 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition" />
              ))}
          </span>

          <div className="flex items-center gap-1 bg- zinc-800 px-2 py-1 rounded-md">
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
      {/* Posted Date */}
      <div className="flex items-center justify-end space-x-3 self-start text-sm text-gray-300">
        <Calendar className="w-4 h-4" />
        <span>Posted: {posted}</span>
      </div>
      {/* Details Column */}
      <div className="space-y-2">
        {(job.company.name || job.company.location) && (
          <div className="text-sm text-gray-400">
            <Link
              to={`/profile/${job.company.accountId}`}
              className="hover:underline text-blue-400"
            >
              {job.company.name}
            </Link>
            {job.company.location ? ` @ ${job.company.location}` : ""}
          </div>
        )}
        {/* Description clamped to 3 lines */}
        <p
          className="text-gray-200 overflow-hidden leading-6"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
          }}
        >
          {job.description}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          {/* Job Type */}
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{job.jobType}</span>
          </span>

          {/* Work Arrangement */}
          {job.workArrangement && (
            <span className="flex items-center gap-1">
              {job.workArrangement === "Remote" && (
                <Laptop className="w-4 h-4 text-gray-400" />
              )}
              {job.workArrangement === "Hybrid" && (
                <Shuffle className="w-4 h-4 text-gray-400" />
              )}
              {job.workArrangement === "Onsite" && (
                <BuildingIcon className="w-4 h-4 text-gray-400" />
              )}
              <span>{job.workArrangement}</span>
            </span>
          )}
          {typeof job.experiencePreferred === "number" &&
            job.experiencePreferred > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                <span>{job.experiencePreferred} yr(s) exp</span>
              </span>
            )}

          {/* Salary */}
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span>
              ${job.minSalary.toLocaleString()}–$
              {job.maxSalary.toLocaleString()}
            </span>
          </span>

          {/* Application Deadline */}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {new Date(job.applicationDeadline).toLocaleDateString(
                dateLocale,
                dateFormatOptions
              )}
            </span>
          </span>
        </div>
      </div>
      {/* Buttons Column */}
      <div className="justify-self-end self-center flex flex-col items-stretch space-y-2 w-full max-w-[140px]">
        {userType === Role.Company && (
          <>
            {/* <button
              onClick={() => navigate(`/company/jobForm/${job.jobId}`)}
              className="flex items-center justify-center border border-yellow-500 text-yellow-500 text-sm font-medium w-full px-4 py-1 rounded-xl hover:bg-yellow-500 hover:text-white transition"
            >
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </button> */}
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center border border-red-500 text-red-500 text-sm font-medium w-full px-4 py-1 rounded-xl hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
          </>
        )}
        <Link
          to={`/jobDetails/${job.jobId}`}
          className="block text-center border border-blue-500 text-blue-500 text-sm font-medium w-full px-4 py-1 rounded-xl hover:bg-blue-500 hover:text-white transition"
        >
          View Details
        </Link>
        {userType === Role.User ? (
          !job.isApplied ? (
            <button
              onClick={() => setOpen(true)}
              className="border border-green-500 text-green-500 text-sm font-medium w-full px-4 py-1 rounded-xl hover:bg-green-500 hover:text-white transition"
            >
              Apply Now
            </button>
          ) : (
            <div className="text-center text-sm text-gray-400 border border-gray-600 w-full px-4 py-1 rounded-xl">
              Applied
            </div>
          )
        ) : userType === Role.Admin ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="border border-red-500 text-red-500 text-sm font-medium w-full px-4 py-1 rounded-xl hover:bg-red-500 hover:text-white transition"
          >
            Delete for moderation
          </button>
        ) : null}
        <ResumeUploadModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={handleResumeSubmit}
          loading={applicationLoading}
          jobTitle={job.title}
          companyName={job.company.name}
        />
        {/* Delete Modal */}
        <DeleteJobModal
          open={deleteOpen}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={loading}
          jobTitle={job.title}
          role={userType as Role}
          violationOptions={violationOptions}
        />
      </div>
    </div>
  );
};

export default JobCard;
