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
} from "lucide-react";
import type { JobListing } from "../../type/jobListing";
import { Link } from "react-router-dom";
import { dateLocale, dateFormatOptions } from "./SharedConfig";
import { useState } from "react";
import ResumeUploadModal from "./ResumeUploadModal";
import { handleResumeSubmit } from "./ResumeUploadModal"; // Assuming this is where the function is defined
type Props = { job: JobListing };

const JobCard: React.FC<Props> = ({ job }) => {
  const posted = new Date(job.createdAt).toLocaleDateString(
    dateLocale,
    dateFormatOptions
  );
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg transition
        grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr] gap-x-6 gap-y-4
      "
    >
      {/* Title + Field Tag */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">{job.title}</h2>
          <button
            aria-label="Save job"
            className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
          >
            <Bookmark className="w-6 h-6" />
          </button>
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
          {job.field}
        </span>
      </div>

      {/* Posted Date */}
      <div className="flex items-center justify-end space-x-3 self-start text-sm text-gray-300">
        <Calendar className="w-4 h-4" />
        <span>Posted: {posted}</span>
      </div>

      {/* Details Column */}
      <div className="space-y-2">
        {(job.companyName || job.companyAddress) && (
          <div className="text-sm text-gray-400">
            {job.companyName}
            {job.companyAddress ? ` @ ${job.companyAddress}` : ""}
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
            <span>{job.type}</span>
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
          {typeof job.yearsOfExperience === "number" &&
            job.yearsOfExperience > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-gray-400" />
                <span>{job.yearsOfExperience} yr(s) exp</span>
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
        <Link
          to={`/jobDetails/${job.jobId}`}
          className="
            block text-center
            border border-blue-500 text-blue-500 text-sm font-medium
            w-full px-4 py-1 rounded-xl
            hover:bg-blue-500 hover:text-white
            transition
          "
        >
          View Details
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="
            border border-green-500 text-green-500 text-sm font-medium
            w-full px-4 py-1 rounded-xl
            hover:bg-green-500 hover:text-white
            transition
          "
        >
          Apply Now
        </button>
        <ResumeUploadModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSubmit={handleResumeSubmit}
          jobTitle={job.title}
          companyName={job.companyName}
        />
      </div>
    </div>
  );
};

export default JobCard;
