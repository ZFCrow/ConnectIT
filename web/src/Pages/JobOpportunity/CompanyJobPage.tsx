// src/pages/CompanyJobsPage.tsx
import React, { useState } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import type { JobListing } from "../../type/jobListing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CURRENT_COMPANY_ID = 101;
// ← in real life, pull this from auth / context

const CompanyJobsPage: React.FC = () => {
  // 1) Keep only this company’s jobs in state
  const [jobs] = useState<JobListing[]>(
    sampleJobs.filter((j) => j.companyId === CURRENT_COMPANY_ID)
  );
  const navigate = useNavigate();
  return (
    <div className="w-4/5 mx-auto pt-4 pb-2 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Posted Jobs</h1>
        <Button onClick={() => navigate("/company/jobForm")}>
          + New Listing
        </Button>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => (
          <div key={job.jobId} className="relative">
            <JobCard job={job} userType="company" />
          </div>
        ))}
        {jobs.length === 0 && (
          <p className="text-gray-400">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyJobsPage;
