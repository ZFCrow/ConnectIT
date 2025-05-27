// src/pages/JobListingPage.tsx
import React, { useState } from "react";
import JobCard from "../../components/JobOpportunity/JobCard";
import { sampleJobs } from "../../components/FakeData/sampleJobs";

import FilterSection from "../../components/JobOpportunity/FilterSection";
import type { SortOption } from "../../components/JobOpportunity/FilterSection";
import { ApplicationToaster } from "@/components/JobOpportunity/ResumeUploadModal";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle } from "lucide-react";
const ITEMS_PER_PAGE = 10;

const JobListingPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterArrangement, setFilterArrangement] = useState<string>("All");
  const [filterField, setFilterField] = useState<string>("All");
  const [minSalary, setMinSalary] = useState<string>("");
  const [maxSalary, setMaxSalary] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const allFields = Array.from(new Set(sampleJobs.map((j) => j.field))).sort();
  allFields.unshift("All");
  // 1) Filter
  const filtered = sampleJobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = filterType === "All" || job.type === filterType;
    const matchesArrangement =
      filterArrangement === "All" || job.workArrangement === filterArrangement;
    const matchesField = filterField === "All" || job.field === filterField;
    const meetsMin = !minSalary || job.minSalary >= Number(minSalary);
    const meetsMax = !maxSalary || job.maxSalary <= Number(maxSalary);
    return (
      matchesSearch &&
      matchesType &&
      matchesArrangement &&
      matchesField &&
      meetsMin &&
      meetsMax
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
      </div>
      {/* Search */}
      <input
        type="text"
        placeholder="Search job titles…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full p-3  border border-zinc-600 rounded-xl"
      />

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

        {/* Job Cards */}
        <div className="flex-1 space-y-6">
          {paginated.length > 0 ? (
            paginated.map((job) => <JobCard key={job.jobId} job={job} />)
          ) : (
            <div className="h-[200px] flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
              <span className="text-gray-400 text-lg">No results found.</span>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 pt-4">
            <button
              onClick={() => setCurrentPage(safePage - 1)}
              disabled={safePage === 1}
              className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
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
            ))}
            <button
              onClick={() => setCurrentPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-3 py-1 rounded-lg bg-zinc-800 text-gray-200 border border-zinc-700 hover:bg-blue-600 hover:text-white disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <ApplicationToaster />
    </div>
  );
};

export default JobListingPage;
