// src/pages/MyJobsPage.tsx
import React, { useEffect, useState } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import {
  FrontendJobListing,
  JobListingSchema,
  type JobListing,
} from "../../type/jobListing";
import axios from "axios";
import { useAuth, Role } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  fetchViolationOptions,
  ViolationOption,
} from "@/utility/fetchViolationOptions";

const ITEMS_PER_PAGE = 10;

export default function MyJobsPage() {
  const [tab, setTab] = useState<"saved" | "applied">("saved");
  const [savedPage, setSavedPage] = useState(1);
  const [appliedPage, setAppliedPage] = useState(1);
  const [jobListings, setJobListings] = useState<FrontendJobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { role, userId } = useAuth();
  const [violationOptions, setViolationOptions] = useState<ViolationOption[]>(
    []
  );
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // Fetch bookmarked & applied IDs
        let bookmarkedIds: number[] = [];
        let appliedIds: number[] = [];
        if (role === Role.Admin) {
          const opts = await fetchViolationOptions();
          setViolationOptions(opts);
        }
        if (role === Role.User && userId) {
          const bookmarkRes = await axios.get(
            `/api/getBookmarkedJob/${userId}`
          );
          bookmarkedIds = bookmarkRes.data ?? [];

          const appliedRes = await axios.get(`/api/getAppliedJobId/${userId}`);
          appliedIds = appliedRes.data ?? [];
        }

        // Fetch all jobs
        const res = await axios.get("/api/joblistings");

        // Add isBookmarked/isApplied fields for each job
        const jobs = Array.isArray(res.data)
          ? res.data
              .map((item) => {
                try {
                  const job = JobListingSchema.parse(item);
                  return {
                    ...job,
                    isBookmarked: bookmarkedIds.includes(job.jobId),
                    isApplied: appliedIds.includes(job.jobId),
                  };
                } catch (err) {
                  console.error("Invalid job listing:", err, item);
                  return null;
                }
              })
              .filter(Boolean)
          : [];
        setJobListings(jobs as JobListing[]);
      } catch (err) {
        console.error("Error loading job listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [role, userId]);

  // Filter by isBookmarked / isApplied fields
  const savedJobs = jobListings.filter((job) => job.isBookmarked);
  const appliedJobs = jobListings.filter((job) => job.isApplied);
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
          mb-5  
        "
      >
        <ArrowLeft className="w-3 h-3" />
        <span>Back to Listing</span>
      </Link>
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
          Saved Jobs ({savedJobs.length})
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
          Applied Jobs ({appliedJobs.length})
        </button>
      </div>

      {/* Job Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <span className="text-lg text-gray-400 animate-pulse">
              Loading...
            </span>
          </div>
        ) : jobsToShow.length > 0 ? (
          jobsToShow.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              setJobListings={setJobListings}
              userType={role}
              violationOptions={violationOptions}
            />
          ))
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
