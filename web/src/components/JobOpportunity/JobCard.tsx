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
  Edit2,
  Trash2,
  User2,
} from "lucide-react";
import type { JobListing } from "../../type/jobListing";
import { Link, useNavigate } from "react-router-dom";
import { dateLocale, dateFormatOptions } from "./SharedConfig";
import { useState } from "react";
import ResumeUploadModal from "./ResumeUploadModal";
import { handleResumeSubmit } from "./ResumeUploadModal"; // Assuming this is where the function is defined
import { Role } from "@/contexts/AuthContext";
import axios from "axios";
import DeleteJobModal from "./DeleteJobModal";
import { useDeleteJob } from "@/utility/handleDeleteJob";

type Props = { job: JobListing; userType: string };

const JobCard: React.FC<Props> = ({ job, userType }) => {
  const navigate = useNavigate();
  const posted = new Date(job.createdAt).toLocaleDateString(
    dateLocale,
    dateFormatOptions
  );
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteJob, loading } = useDeleteJob(() => {
    setDeleteOpen(false);
    window.location.reload();
  });

  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteConfirm = () => {
    deleteJob(job.jobId);
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
            {userType === Role.Company ? (
              <span className="text-gray-400">#{job.jobId}</span>
            ) : (
              <></>
            )}{" "}
            {job.title}
          </h2>

          {userType === Role.Company ? (
            <>
              <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-md">
                <User2 className="w-5 h-5 text-gray-300" />
                <span className="text-sm font-medium text-gray-300">
                  3 application(s)
                  {/* TODO: Replace with actual count */}
                </span>
              </div>
            </>
          ) : job.saved ? (
            <BookmarkCheck className="w-6 h-6 text-green-500" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full transition" />
          )}
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
            {job.company.name}
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
              {job.workArrangement === "Office" && (
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
        {userType !== Role.Company &&
          (!job.applied ? (
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
          ))}
        <ResumeUploadModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={handleResumeSubmit}
          jobTitle={job.title}
          companyName={job.companyName}
        />
        {/* Delete Modal */}
        <DeleteJobModal
          open={deleteOpen}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          loading={loading}
          jobTitle={job.title}
        />
      </div>
    </div>
  );
};

export default JobCard;
