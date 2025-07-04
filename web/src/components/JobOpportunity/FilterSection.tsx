// src/components/JobListing/FilterSection.tsx
import React from "react";

export type SortOption = "newest" | "salaryLowHigh" | "salaryHighLow";

interface FilterSectionProps {
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterArrangement: string;
  onFilterArrangementChange: (value: string) => void;
  filterField: string;
  onFilterFieldChange: (v: string) => void;
  fieldOptions: string[];
  minSalary: string;
  onMinSalaryChange: (value: string) => void;
  maxSalary: string;
  onMaxSalaryChange: (value: string) => void;
  sortOption: SortOption;
  onSortOptionChange: (value: SortOption) => void;
}

const jobTypes = ["All", "Full Time", "Part Time", "Contract", "Internship"];
const arrangements = ["All", "Remote", "Hybrid", "Onsite"];

const FilterSection: React.FC<FilterSectionProps> = ({
  filterType,
  onFilterTypeChange,
  filterArrangement,
  onFilterArrangementChange,
  filterField,
  onFilterFieldChange,
  fieldOptions,
  minSalary,
  onMinSalaryChange,
  maxSalary,
  onMaxSalaryChange,
  sortOption,
  onSortOptionChange,
}) => (
  <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg transition space-y-6">
    <h2 className="text-xl font-semibold text-white">Filters &amp; Sorting</h2>

    {/* Job Type */}
    <div className="space-y-1">
      <label className="block text-sm text-gray-300">Job Type</label>
      <select
        value={filterType}
        onChange={(e) => onFilterTypeChange(e.target.value)}
        className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
      >
        {jobTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>

    {/* Work Arrangement */}
    <div className="space-y-1">
      <label className="block text-sm text-gray-300">Work Arrangement</label>
      <select
        value={filterArrangement}
        onChange={(e) => onFilterArrangementChange(e.target.value)}
        className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
      >
        {arrangements.map((arr) => (
          <option key={arr} value={arr}>
            {arr}
          </option>
        ))}
      </select>
    </div>
    {/* Field Selection */}
    <div className="space-y-1">
      <label className="block text-sm text-gray-300">Field</label>
      <select
        value={filterField}
        onChange={(e) => onFilterFieldChange(e.target.value)}
        className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
      >
        {fieldOptions.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
    {/* Salary Range */}
    <div className="space-y-1">
      <label className="block text-sm text-gray-300">Salary Range (SGD)</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={minSalary}
          onChange={(e) => onMinSalaryChange(e.target.value)}
          placeholder="Min"
          min={0}
          step={100}
          className="w-1/2 p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
        />
        <input
          type="number"
          value={maxSalary}
          onChange={(e) => onMaxSalaryChange(e.target.value)}
          placeholder="Max"
          min={0}
          step={100}
          className="w-1/2 p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
        />
      </div>
    </div>

    {/* Sort By */}
    <div className="space-y-1">
      <label className="block text-sm text-gray-300">Sort By</label>
      <select
        value={sortOption}
        onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
        className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition"
      >
        <option value="newest">Newest</option>
        <option value="salaryLowHigh">Salary: Low to High</option>
        <option value="salaryHighLow">Salary: High to Low</option>
      </select>
    </div>
  </div>
);

export default FilterSection;
