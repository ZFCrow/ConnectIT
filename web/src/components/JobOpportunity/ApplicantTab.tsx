// src/pages/company/ApplicantsTab.tsx
import React, { useState, useMemo } from "react";
import { Mail, Phone, FileText, Calendar as CalIcon } from "lucide-react";
import type { JobListing } from "../../type/jobListing";
import type { Applicant } from "../../type/applicant";
import ApplicantCard from "./ApplicantCard";

interface ApplicantsTabProps {
  jobs: JobListing[];
  applicants: Applicant[];
}

const ApplicantsTab: React.FC<ApplicantsTabProps> = ({ jobs, applicants }) => {
  const [jobFilter, setJobFilter] = useState<"All" | string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const statusOptions = ["All", "Applied", "Shortlisted", "Rejected"];

  // 1️⃣ Decorate applicants with jobTitle and keep only this company's
  const decorated = useMemo(() => {
    return applicants
      .filter((a) => jobs.some((j) => j.jobId === a.jobId))
      .map((a) => ({
        ...a,
        jobTitle: jobs.find((j) => j.jobId === a.jobId)?.title ?? "Unknown",
      }));
  }, [applicants, jobs]);

  // 2️⃣ Filter by selected jobId and status
  const filtered = decorated.filter(
    ({ jobId, status }) =>
      (jobFilter === "All" || jobId.toString() === jobFilter) &&
      (statusFilter === "All" || status === statusFilter)
  );

  // 3️⃣ Handlers (stub out real API calls here)
  const handleAccept = (id: number) => {
    console.log("Accept", id);
  };
  const handleDelete = (id: number) => {
    console.log("Delete", id);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Job Filter */}
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-gray-100 rounded px-3 py-2"
        >
          <option value="All">All Jobs</option>
          {jobs.map((j) => (
            <option key={j.jobId} value={j.jobId.toString()}>
              {j.title} #{j.jobId}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-gray-100 rounded px-3 py-2"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Applicant Cards */}
      {filtered.length > 0 ? (
        <ul className="space-y-5">
          {filtered.map((app) => (
            <ApplicantCard
              key={app.applicantId}
              applicant={app}
              onAccept={handleAccept}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No applicants match the criteria.</p>
      )}
    </div>
  );
};

export default ApplicantsTab;
