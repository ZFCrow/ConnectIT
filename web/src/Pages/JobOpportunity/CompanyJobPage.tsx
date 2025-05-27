import React, { useState } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import type { JobListing } from "../../type/jobListing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ApplicantsTab from "../../components/JobOpportunity/ApplicantTab";
import type { Applicant } from "../../type/applicant";
import { sampleApplicants } from "../../components/FakeData/sampleApplicants";
const CURRENT_COMPANY_ID = 101; // Replace with auth/context

const CompanyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");

  // All jobs for this company
  const jobs: JobListing[] = sampleJobs.filter(
    (job) => job.companyId === CURRENT_COMPANY_ID
  );
  // applicants in this company
  const applicants: Applicant[] = sampleApplicants.filter((applicant) =>
    jobs.some((job) => job.jobId === applicant.jobId)
  );
  return (
    <div className="w-4/5 mx-auto pt-4 pb-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
        <Button onClick={() => navigate("/company/jobForm")}>
          + New Listing
        </Button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 -mb-px text-sm font-medium ${
            activeTab === "jobs"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => setActiveTab("applicants")}
          className={`ml-4 px-4 py-2 -mb-px text-sm font-medium ${
            activeTab === "applicants"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Applicants
        </button>
      </div>

      {/* Content */}
      <div className="mt-6 space-y-6">
        {activeTab === "jobs" ? (
          jobs.length ? (
            jobs.map((job) => (
              <JobCard key={job.jobId} job={job} userType="company" />
            ))
          ) : (
            <p className="text-gray-400">No jobs posted yet.</p>
          )
        ) : (
          <div>
            {/* Filters */}
            <ApplicantsTab applicants={applicants} jobs={jobs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsPage;
