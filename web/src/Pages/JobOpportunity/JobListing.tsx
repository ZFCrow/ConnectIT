// src/pages/JobListingPage.tsx
import React, { useState, useEffect } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import FilterSection from "../../components/JobOpportunity/FilterSection";
import type { SortOption } from "../../components/JobOpportunity/FilterSection";
import { ApplicationToaster } from "@/components/CustomToaster";
import LoadingSpinner from "@/components/ui/loading-circle";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle } from "lucide-react";
import { FrontendJobListing, JobListing } from "@/type/jobListing";
import { JobListingSchema } from "@/type/jobListing";
import axios from "@/utility/axiosConfig";
import { Role, useAuth } from "@/contexts/AuthContext";
import {
  fetchViolationOptions,
  ViolationOption,
} from "@/utility/fetchViolationOptions";

const ITEMS_PER_PAGE = 10;

const JobListingPage: React.FC = () => {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, userId } = useAuth();
  const [violationOptions, setViolationOptions] = useState<ViolationOption[]>(
    []
  );

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch violation options and jobs in parallel
        const [violations, jobsData] = await Promise.all([
          fetchViolationOptions().catch(() => []),
          (async () => {
            let bookmarkedIds: number[] = [];
            let appliedIds: number[] = [];
            if (role === Role.User && userId) {
              const bookmarkRes = await axios.get(
                `/api/getBookmarkedJob/${userId}`
              );
              bookmarkedIds = bookmarkRes.data ?? [];
              const appliedRes = await axios.get(
                `/api/getAppliedJobId/${userId}`
              );
              appliedIds = appliedRes.data ?? [];
            }
            const res = await axios.get("/api/joblistings");
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
            return jobs;
          })(),
        ]);

        setViolationOptions(violations);
        setJobListings(jobsData as FrontendJobListing[]);
      } catch (err) {
        // Handle error as needed
        setViolationOptions([]);
        setJobListings([]);
      } finally {
        setLoading(false); // Only set to false after BOTH are done
      }
    };
    fetchAll();
  }, [role, userId]);

  const [filterType, setFilterType] = useState<string>("All");
  const [filterArrangement, setFilterArrangement] = useState<string>("All");
  const [filterField, setFilterField] = useState<string>("All");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const allFields = Array.from(
    new Set(jobListings.map((j) => j.fieldOfWork))
  ).sort();
  allFields.unshift("All");

  // 1) Filter
  const filtered = jobListings.filter((job) => {
    const matchesType = filterType === "All" || job.jobType === filterType;
    const matchesArrangement =
      filterArrangement === "All" || job.workArrangement === filterArrangement;
    const matchesField =
      filterField === "All" || job.fieldOfWork === filterField;
    const meetsMin = !minSalary || job.minSalary >= Number(minSalary);
    const meetsMax = !maxSalary || job.maxSalary <= Number(maxSalary);
    return (
      matchesType && matchesArrangement && matchesField && meetsMin && meetsMax
    );
  });

  // 2) Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "salaryLowHigh":
        return a.minSalary - b.minSalary;
      case "salaryHighLow":
        return b.maxSalary - a.maxSalary;
      default:
        return 0;
    }
  });

  // 3) Paginate
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1;
  // keep currentPage in [1, totalPages]
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = sorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Opportunities Board</h1>
        {role !== Role.Admin && (
          <Link
            to="/myJobs"
            className="
            inline-flex items-center gap-2
            text-xl font-medium text-blue-500
            hover:text-blue-600 transition
          "
          >
            <Bookmark className="w-6 h-6" />
            <span>Saved</span>
            <span className="mx-1 text-2xl">/</span>
            <CheckCircle className="w-6 h-6" />
            <span>Applied Jobs</span>
          </Link>
        )}
      </div>
      {/* Search
      <input
        type="text"
        placeholder="Search job titles…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full p-3  border border-zinc-600 rounded-xl"
      /> */}

      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-1/4">
          <FilterSection
            filterType={filterType}
            onFilterTypeChange={(v) => {
              setFilterType(v);
              setCurrentPage(1);
            }}
            filterArrangement={filterArrangement}
            onFilterArrangementChange={(v) => {
              setFilterArrangement(v);
              setCurrentPage(1);
            }}
            filterField={filterField}
            onFilterFieldChange={(v) => {
              setFilterField(v);
              setCurrentPage(1);
            }}
            fieldOptions={allFields}
            minSalary={minSalary}
            onMinSalaryChange={(v) => {
              setMinSalary(v);
              setCurrentPage(1);
            }}
            maxSalary={maxSalary}
            onMaxSalaryChange={(v) => {
              setMaxSalary(v);
              setCurrentPage(1);
            }}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
          />
        </div>
        {/* Job Cards column (with loading, jobs, or no results) */}
        <div className="flex-1 space-y-6">
          {loading ? (
            <LoadingSpinner
              message="Loading jobs..."
              className="h-[200px] flex items-center justify-center"
            />
          ) : paginated.length > 0 ? (
            paginated.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                userType={role}
                setJobListings={setJobListings}
                violationOptions={violationOptions}
              />
            ))
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
              <span className="text-gray-400 text-lg">No results found.</span>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && paginated.length > 0 && (
            <div className="flex justify-center items-center space-x-2 pt-4">
              <button
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={safePage === 1}
                className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`
                      px-3 py-1 rounded-lg border
                      ${
                        num === safePage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-zinc-800 text-gray-200 border-zinc-700 hover:bg-blue-600 hover:text-white"
                      }
                      transition
                    `}
                  >
                    {num}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <ApplicationToaster />
    </div>
  );
};

export default JobListingPage;
