import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import JobDetailsCard from "../../components/JobOpportunity/JobDetailsCard";
import { jobListingRoute } from "@/components/JobOpportunity/SharedConfig";
import { ApplicationToaster } from "@/components/CustomToaster";
import { Role, useAuth } from "@/contexts/AuthContext";
import axios from "@/utility/axiosConfig";
import {
  FrontendJobListing,
  JobListing,
  JobListingSchema,
} from "@/type/jobListing";
import { useEffect, useState } from "react";
import {
  fetchViolationOptions,
  ViolationOption,
} from "@/utility/fetchViolationOptions";

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<FrontendJobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [violationOptions, setViolationOptions] = useState<ViolationOption[]>(
    []
  );
  const { role, userId, companyId } = useAuth();

  useEffect(() => {
    if (!jobId) return;

    const loadAll = async () => {
      setLoading(true);

      try {
        // ────────── fetch core job + violation list first ──────────
        const [jobRes, violationOpts] = await Promise.all([
          axios.get(`/api/jobDetails/${jobId}`),
          fetchViolationOptions(),
        ]);

        // Parse the bare job
        const parsed = JobListingSchema.parse(
          jobRes.data
        ) as FrontendJobListing;

        // ────────── fetch bookmark / application status (if user) ──────────
        if (role === Role.User && userId) {
          const [bookmarkRes, appliedRes] = await Promise.all([
            axios.get(`/api/getBookmarkedJob/${userId}`), // returns [jobId…]
            axios.get(`/api/getAppliedJobId/${userId}`), // returns [jobId…]
          ]);

          const bookmarkedIds: number[] = bookmarkRes.data ?? [];
          const appliedIds: number[] = appliedRes.data ?? [];

          parsed.isBookmarked = bookmarkedIds.includes(parsed.jobId);
          parsed.isApplied = appliedIds.includes(parsed.jobId);
        } else {
          // viewer is company/admin/guest: default flags
          parsed.isBookmarked = false;
          parsed.isApplied = false;
        }

        setJob(parsed);
        setViolationOptions(violationOpts);
      } catch (err) {
        console.error("Failed to load job details / violations", err);
        setJob(null);
        setViolationOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [jobId, role, userId]);
  // const job = sampleJobs.find((j) => j.jobId === Number(jobId));
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
