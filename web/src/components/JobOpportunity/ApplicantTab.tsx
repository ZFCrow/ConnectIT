import React, { useState, useMemo, useEffect } from "react";
import type { JobListing } from "../../type/jobListing";
import type { JobApplication } from "../../type/JobApplicationSchema";
import ApplicantCard from "./ApplicantCard";
import axios from "axios";
import { toast } from "react-hot-toast";

interface ApplicantsTabProps {
  jobs: JobListing[];
  applicants: JobApplication[];
}

const statusOptions = ["All", "Applied", "Accepted", "Rejected"];

const ApplicantsTab: React.FC<ApplicantsTabProps> = ({ jobs, applicants }) => {
  const [jobFilter, setJobFilter] = useState<"All" | string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");

  // 1️⃣ Make a local copy of applicants so we can update them
  const [localApplicants, setLocalApplicants] = useState<JobApplication[]>([]);
  const [acceptLoadingId, setAcceptLoadingId] = useState<number | null>(null);
  const [rejectLoadingId, setRejectLoadingId] = useState<number | null>(null);

  // 2️⃣ Sync local state to prop on mount or when applicants prop changes
  useEffect(() => {
    setLocalApplicants(applicants);
  }, [applicants]);

  // 3️⃣ Decorate with job title
  const decorated = useMemo(() => {
    return localApplicants
      .filter((a) => jobs.some((j) => j.jobId === a.jobId))
      .map((a) => ({
        ...a,
        jobTitle: jobs.find((j) => j.jobId === a.jobId)?.title ?? "Unknown",
      }));
  }, [localApplicants, jobs]);

  // 4️⃣ Filter by job and status
  const filtered = decorated.filter(
    ({ jobId, status }) =>
      (jobFilter === "All" || jobId.toString() === jobFilter) &&
      (statusFilter === "All" || status === statusFilter)
  );

  // 5️⃣ Update status locally on Accept
  const handleAccept = async (applicationId: number) => {
    setAcceptLoadingId(applicationId);

    try {
      await axios.post(`/api/approveApplication/${applicationId}`);
      setLocalApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? { ...app, status: "Accepted" }
            : app
        )
      );
      toast.success("Applicant accepted!");
    } catch (err) {
      toast.error("Failed to accept applicant.");
      console.error("Accept error:", err);
    } finally {
      setAcceptLoadingId(null);
    }
  };

  // 6️⃣ Remove applicant locally on Delete
  const handleDelete = async (applicationId: number) => {
    setRejectLoadingId(applicationId);

    try {
      await axios.delete(`/api/rejectApplication/${applicationId}`);
      setLocalApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? { ...app, status: "Rejected" }
            : app
        )
      );
      toast.success("Applicant rejected/removed.");
    } catch (err) {
      toast.error("Failed to reject applicant.");
      console.error("Delete error:", err);
    } finally {
      setRejectLoadingId(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
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
      {/* Applicants List */}
      {filtered.length > 0 ? (
        <ul className="space-y-5">
          {filtered.map((app) => (
            <ApplicantCard
              key={app.applicationId}
              applicant={app}
              acceptLoading={acceptLoadingId === app.applicationId}
              rejectLoading={rejectLoadingId === app.applicationId}
              onAccept={() => handleAccept(app.applicationId)}
              onDelete={() => handleDelete(app.applicationId)}
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
