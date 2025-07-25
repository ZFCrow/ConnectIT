import React, { useState, useEffect } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import type { JobListing } from "../../type/jobListing";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ApplicantsTab from "../../components/JobOpportunity/ApplicantTab";
import {
  JobApplicationSchema,
  type JobApplication,
} from "../../type/JobApplicationSchema";
import axios from "@/utility/axiosConfig";
import { JobListingSchema } from "../../type/jobListing";
import { Role, useAuth } from "@/contexts/AuthContext";
import { ApplicationToaster } from "@/components/CustomToaster";

const CompanyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"jobs" | "applicants">("jobs");
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const { companyId } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch both in parallel
        const [jobsRes, appsRes] = await Promise.all([
          axios.get(`/api/companyJobListings/${companyId}`),
          axios.get(`/api/getApplicantsByCompanyId/${companyId}`),
        ]);

        // Parse and validate
        const jobs = Array.isArray(jobsRes.data)
          ? jobsRes.data
              .map((item) => {
                try {
                  return JobListingSchema.parse(item);
                } catch (err) {
                  console.error("Invalid job listing:", err, item);
                  return null;
                }
              })
              .filter(Boolean)
          : [];
        setJobListings(jobs as JobListing[]);

        const applications = JobApplicationSchema.array().parse(appsRes.data);
        setJobApplications(applications);
      } catch (err) {
        console.error(
          "Error loading jobs or applications:",
          err.response || err
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId]);
  // applicants in this company
  // const applicants: Applicant[] = sampleApplicants.filter((applicant) =>
  //   jobListings.some((job) => job.jobId === applicant.jobId)
  // );

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
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <span className="text-lg text-gray-400 animate-pulse">
              Loading...
            </span>
          </div>
        ) : activeTab === "jobs" ? (
          jobListings.length ? (
            jobListings.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                userType={Role.Company}
                setJobListings={setJobListings}
                violationOptions={[]}
              />
            ))
          ) : (
            <p className="text-gray-400">No jobs posted yet.</p>
          )
        ) : (
          <div>
            <ApplicantsTab applicants={jobApplications} jobs={jobListings} />
          </div>
        )}
      </div>
      <ApplicationToaster />{" "}
    </div>
  );
};

export default CompanyJobsPage;
