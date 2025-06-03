// src/components/ApplicantCard.tsx
import React from "react";
import { Mail, FileText, Calendar as CalIcon } from "lucide-react";
import type { Applicant } from "../../type/applicant";

export type ApplicantCardProps = {
  applicant: Applicant & { jobTitle: string };
  onAccept?: (id: number) => void;
  onDelete?: (id: number) => void;
};

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onAccept,
  onDelete,
}) => {
  const {
    applicantId,
    firstName,
    lastName,
    email,
    resumeUrl,
    status,
    jobTitle,
    jobId,
    appliedAt,
  } = applicant;

  const appliedDate = new Date(appliedAt).toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <li className="relative bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-3">
          {/* 1) Name + Job Title + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-white">
              {firstName} {lastName}
            </span>
            <span className="px-2 py-1 bg-zinc-800 text-gray-200 text-xs rounded">
              {jobTitle} #{jobId}
            </span>
            <span
              className={`${
                status === "Applied"
                  ? "bg-blue-600"
                  : status === "Shortlisted"
                  ? "bg-green-600"
                  : "bg-red-600"
              } text-white px-2 py-1 text-xs font-semibold uppercase rounded-full`}
            >
              {status}
            </span>
          </div>

          {/* 2) Email row */}
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Mail className="w-5 h-5" />
            <a href={`mailto:${email}`} className="underline text-gray-200">
              {email}
            </a>
          </div>

          {/* 3) Resume row */}
          {resumeUrl && (
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <FileText className="w-5 h-5" />
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gray-200"
              >
                View Resume
              </a>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (empty placeholder to maintain flex layout) */}
        <div className="w-full md:w-auto" />
      </div>

      {/* Applied Date - absolutely positioned at top-right (inside padding) */}
      <div className="absolute top-6 right-6 flex items-center space-x-2 text-sm text-gray-300">
        <CalIcon className="w-5 h-5" />
        <span>Applied on: {appliedDate}</span>
      </div>

      {/* Buttons - centered vertically on the right side */}
      {status === "Applied" && (
        <div className="absolute top-1/2 right-6 flex -translate-y-1/2 space-x-2 mt-4">
          <button
            onClick={() => onAccept?.(applicantId)}
            className="border border-green-500 text-green-500 bg-transparent px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 hover:text-white transition"
          >
            Accept
          </button>
          <button
            onClick={() => onDelete?.(applicantId)}
            className="border border-red-500 text-red-500 bg-transparent px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white transition"
          >
            Reject
          </button>
        </div>
      )}
    </li>
  );
};

export default ApplicantCard;
