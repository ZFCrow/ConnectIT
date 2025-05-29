// src/components/ApplicantCard.tsx
import React from "react";
import { Mail, Phone, FileText, Calendar as CalIcon } from "lucide-react";
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
    phoneNumber,
    resumeUrl,
    coverLetter,
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
    <li
      className={
        "bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg " +
        "grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] gap-x-6 gap-y-4"
      }
    >
      {/* Header Left */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-white">
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
      </div>

      {/* Header Right (Date) */}
      <div className="flex items-center justify-end space-x-2 text-sm text-gray-300">
        <CalIcon className="w-4 h-4" />
        <span>Applied on: {appliedDate}</span>
      </div>

      {/* Details Left */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center text-sm text-gray-300 gap-6">
          <div className="flex items-center space-x-1">
            <Mail size={16} />
            <a href={`mailto:${email}`} className="underline text-gray-200">
              {email}
            </a>
          </div>
          {phoneNumber && (
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>{phoneNumber}</span>
            </div>
          )}
          {resumeUrl && (
            <div className="flex items-center space-x-1">
              <FileText size={16} />
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-gray-200"
              >
                Resume
              </a>
            </div>
          )}
        </div>

        {coverLetter && (
          <p className="text-gray-200 text-sm">
            <strong>Cover Letter:</strong> {coverLetter}
          </p>
        )}
      </div>

      {/* Actions Right */}
      <div className="justify-self-end self-center flex flex-col items-stretch space-y-2 w-full max-w-[140px]">
        {status === "Applied" && (
          <>
            <button
              onClick={() => onAccept?.(applicantId)}
              className={
                "flex items-center justify-center border border-green-500 text-green-500 " +
                "text-sm font-medium w-full px-4 py-1 rounded-xl " +
                "hover:bg-green-500 hover:text-white transition"
              }
            >
              Accept
            </button>
            <button
              onClick={() => onDelete?.(applicantId)}
              className={
                "flex items-center justify-center border border-red-500 text-red-500 " +
                "text-sm font-medium w-full px-4 py-1 rounded-xl " +
                "hover:bg-red-500 hover:text-white transition"
              }
            >
              Reject
            </button>
          </>
        )}
      </div>
    </li>
  );
};

export default ApplicantCard;
