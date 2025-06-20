import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import JobDetailsCard from "../../components/JobOpportunity/JobDetailsCard";
import { jobListingRoute } from "@/components/JobOpportunity/SharedConfig";
import { ApplicationToaster } from "@/components/CustomToaster";
import { Role, useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { JobListing, JobListingSchema } from "@/type/jobListing";
import { useEffect, useState } from "react";
import {
  fetchViolationOptions,
  ViolationOption,
} from "@/utility/fetchViolationOptions";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [violationOptions, setViolationOptions] = useState<ViolationOption[]>(
    []
  );

  useEffect(() => {
    if (!jobId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [jobRes, violationOpts] = await Promise.all([
          axios.get(`/api/jobDetails/${jobId}`),
          fetchViolationOptions(),
        ]);

        // parse + set
        setJob(JobListingSchema.parse(jobRes.data));
        setViolationOptions(violationOpts);
      } catch (err) {
        console.error("Failed to load job details or violations", err);
        setJob(null);
        setViolationOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [jobId]);

  // const job = sampleJobs.find((j) => j.jobId === Number(jobId));
  const { role, userId, companyId } = useAuth();
  if (!job) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[30vh]">
          <span className="text-gray-400 text-lg animate-pulse">
            Loading job details…
          </span>
        </div>
      );
    }
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <Link
          to={
            role === Role.Company
              ? "/company/recruitmentDashboard"
              : "/jobListing"
          }
          className="
          inline-flex items-center space-x-1
          text-s font-medium
          text-gray-300 bg-zinc-800
          px-2 py-1 rounded
          hover:bg-gray-700 hover:text-white
          transition-colors
          -mt-2
          mb-2  
        "
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Listing</span>
        </Link>
        <div className="mt-6 text-center text-gray-400">Job not found.</div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <Link
        to={
          role === Role.Company
            ? "/company/recruitmentDashboard"
            : "/jobListing"
        }
        className="
          inline-flex items-center space-x-1
          text-s font-medium
          text-gray-300 bg-zinc-800
          px-2 py-1 rounded
          hover:bg-gray-700 hover:text-white
          transition-colors
          -mt-2
          mb-2  
        "
      >
        <ArrowLeft className="w-3 h-3" />
        <span>Back to Listing</span>
      </Link>
      {/* Job details in a card */}
      <JobDetailsCard
        job={job}
        userType={!role ? "" : role}
        setJob={setJob}
        violationOptions={violationOptions}
      />
      <ApplicationToaster />{" "}
    </div>
  );
}
