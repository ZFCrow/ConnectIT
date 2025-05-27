// src/pages/MyJobsPage.tsx
import React, { useState } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import type { JobListing } from "../../type/jobListing";

const ITEMS_PER_PAGE = 10;

export default function MyJobsPage() {
  const [tab, setTab] = useState<"saved" | "applied">("saved");
  const [savedPage, setSavedPage] = useState(1);
  const [appliedPage, setAppliedPage] = useState(1);

  // Replace these with your real data source (e.g. context or localStorage)
  sampleJobs.forEach((job) => {
    job.saved = job.jobId % 2 === 1; // odd → saved
    job.applied = job.jobId % 2 === 0; // even → applied
  });
  const savedJobIds = sampleJobs.filter((j) => j.saved).map((j) => j.jobId);
  const appliedJobIds = sampleJobs.filter((j) => j.applied).map((j) => j.jobId);

  const savedJobs = sampleJobs.filter((j) => savedJobIds.includes(j.jobId));
  const appliedJobs = sampleJobs.filter((j) => appliedJobIds.includes(j.jobId));

  const totalSavedPages = Math.max(
    1,
    Math.ceil(savedJobs.length / ITEMS_PER_PAGE)
  );
  const totalAppliedPages = Math.max(
    1,
    Math.ceil(appliedJobs.length / ITEMS_PER_PAGE)
  );

  const currentPage = tab === "saved" ? savedPage : appliedPage;
  const totalPages = tab === "saved" ? totalSavedPages : totalAppliedPages;
  const jobsToShow: JobListing[] = (
    tab === "saved" ? savedJobs : appliedJobs
  ).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const setPage = (page: number) => {
    if (tab === "saved") setSavedPage(page);
    else setAppliedPage(page);
  };

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">My Jobs</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-zinc-700">
        <button
          onClick={() => {
            setTab("saved");
            setSavedPage(1);
          }}
          className={`pb-2 ${
            tab === "saved"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Saved Jobs
        </button>
        <button
          onClick={() => {
            setTab("applied");
            setAppliedPage(1);
          }}
          className={`pb-2 ${
            tab === "applied"
              ? "border-b-2 border-blue-500 text-white"
              : "text-gray-400"
          }`}
        >
          Applied Jobs
        </button>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {jobsToShow.length > 0 ? (
          jobsToShow.map((job) => <JobCard key={job.jobId} job={job} />)
        ) : (
          <div className="h-[200px] flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
            <span className="text-gray-400 text-lg">
              No {tab === "saved" ? "saved" : "applied"} jobs found.
            </span>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 pt-4">
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`
              px-3 py-1 rounded-lg border transition
              ${
                num === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-zinc-800 text-gray-200 border-zinc-700 hover:bg-blue-600 hover:text-white"
              }
            `}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
