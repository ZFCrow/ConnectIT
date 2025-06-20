import React from "react";
import { Mail, FileText, Calendar as CalIcon } from "lucide-react";
import type { JobApplication } from "../../type/JobApplicationSchema"; // Use your JobApplication Zod type
import PdfViewerModal from "../PortfolioModal";

export type ApplicantCardProps = {
  applicant: JobApplication & { jobTitle: string }; // Use JobApplication, not Applicant, and add jobTitle.
  acceptLoading?: boolean; // Optional loading state for accept button
  rejectLoading?: boolean; // Optional loading state for reject button
  onAccept?: (id: number) => void;
  onDelete?: (id: number) => void;
};

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  acceptLoading,
  rejectLoading,
  onAccept,
  onDelete,
}) => {
  const {
    applicationId,
    name,
    email,
    resumeURL, // Use resumeURL, not resumeUrl!
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
  const [pdfOpen, setPdfOpen] = React.useState(false);
  return (
    <li className="relative bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-3">
          {/* 1) Name + Job Title + Status */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-white">{name}</span>
            <span className="px-2 py-1 bg-zinc-800 text-gray-200 text-xs rounded">
              {jobTitle} #{jobId}
            </span>
            <span
              className={`${
                status === "Applied"
                  ? "bg-blue-600"
                  : status === "Accepted"
                  ? "bg-green-600"
                  : "bg-red-600"
              } text-white px-2 py-1 text-xs font-semibold uppercase rounded-full`}
            >
              {status}
            </span>
          </div>

          {/* Email & Resume Row */}
          <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-300 mb-1">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <a href={`mailto:${email}`} className="underline text-gray-200">
                {email}
              </a>
            </div>
            {resumeURL && (
              <button
                onClick={() => setPdfOpen(true)}
                className="flex items-center space-x-1 underline text-gray-200"
              >
                <FileText className="w-5 h-5" />
                <span>View résumé</span>
              </button>
            )}
          </div>
          {/* Bio Row */}
          {applicant.bio && (
            <div className="text-gray-300 mt-1 whitespace-pre-line">
              {applicant.bio}
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
        <>
          <div className="absolute top-1/2 right-6 flex -translate-y-1/2 space-x-2 mt-4">
            {/* Accept Button */}
            <button
              onClick={() => onAccept?.(applicationId)}
              disabled={acceptLoading || rejectLoading}
              className="border border-green-500 text-green-500 bg-transparent px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 hover:text-white transition disabled:opacity-50"
            >
              {acceptLoading && (
                <svg
                  className="animate-spin h-5 w-5 inline mr-1"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              Accept
            </button>
            {/* Reject Button */}
            <button
              onClick={() => onDelete?.(applicationId)}
              disabled={acceptLoading || rejectLoading}
              className="border border-red-500 text-red-500 bg-transparent px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
            >
              {rejectLoading && (
                <svg
                  className="animate-spin h-5 w-5 inline mr-1"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              Reject
            </button>
          </div>
          <PdfViewerModal
            isOpen={pdfOpen}
            onClose={function (): void {
              setPdfOpen(false);
            }}
            pdfUrl={resumeURL} // Pass the resume URL to the modal
            title="Viewing Resume" // Optional title for the modal
          />
        </>
      )}
    </li>
  );
};

export default ApplicantCard;
