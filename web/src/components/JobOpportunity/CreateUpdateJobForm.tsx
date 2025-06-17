import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { JobListing } from "../../type/jobListing";
import { sampleJobs } from "../FakeData/sampleJobs";

// Static lists
const jobTypes = ["Full Time", "Part Time", "Contract", "Internship"];
const arrangements = ["Remote", "Hybrid", "Onsite"];
const fieldOptions = [
  "UI/UX",
  "Software Development",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Product Management",
  "Data Science",
];

// Default empty job
const defaultJob = (): JobListing => ({
  applicants: [],
  jobId: Date.now(),
  companyId: 123,
  title: "",
  field: fieldOptions[0],
  description: "",
  type: jobTypes[0],
  workArrangement: arrangements[2],
  minSalary: 0,
  maxSalary: 0,
  createdAt: new Date().toISOString(),
  applicationDeadline: new Date().toISOString(),
  responsibilities: [""],
  experiencePreferred: 0,
});

interface JobFormProps {
  initialJob: JobListing | null;
  onSubmit: (job: JobListing) => void;
  onCancel: () => void;
}

export function JobForm({ initialJob, onSubmit, onCancel }: JobFormProps) {
  const [form, setForm] = useState<JobListing>(initialJob ?? defaultJob());

  useEffect(() => {
    if (initialJob) setForm(initialJob);
  }, [initialJob]);

  const change = <K extends keyof JobListing>(key: K, value: JobListing[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDate = (e: ChangeEvent<HTMLInputElement>) => {
    change("applicationDeadline", new Date(e.target.value).toISOString());
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">
          Basic Information
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Job Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => change("title", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="field"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Field
            </label>
            <select
              id="field"
              value={form.field}
              onChange={(e) => change("field", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {fieldOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Description */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">
          Job Description
        </legend>
        <textarea
          id="description"
          rows={5}
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the role, responsibilities, and requirements..."
        />
      </fieldset>

      {/* Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">Details</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Job Type
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => change("type", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="arrangement"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Work Arrangement
            </label>
            <select
              id="arrangement"
              value={form.workArrangement}
              onChange={(e) => change("workArrangement", e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {arrangements.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="minSalary"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Min Salary (SGD)
            </label>
            <input
              id="minSalary"
              type="number"
              step={100}
              value={form.minSalary === 0 ? "" : form.minSalary}
              onChange={(e) =>
                change(
                  "minSalary",
                  e.target.value === "" ? "" : +e.target.value
                )
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="maxSalary"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Max Salary (SGD)
            </label>
            <input
              id="maxSalary"
              type="number"
              step={100}
              value={form.maxSalary === 0 ? "" : form.maxSalary}
              onChange={(e) =>
                change(
                  "maxSalary",
                  e.target.value === "" ? "" : +e.target.value
                )
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="experiencePreferred"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Experience Preferred (years)
          </label>
          <input
            id="experiencePreferred"
            type="number"
            min={0}
            value={form.experiencePreferred ?? 0}
            onChange={(e) => change("experiencePreferred", +e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </fieldset>

      {/* Application Deadline */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">
          Application Deadline
        </legend>
        <input
          id="deadline"
          type="date"
          value={form.applicationDeadline.slice(0, 10)}
          onChange={handleDate}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
        />
      </fieldset>

      {/* Responsibilities */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">
          Responsibilities
        </legend>
        <div className="space-y-3">
          {form.responsibilities?.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={r}
                onChange={(e) => {
                  const arr = [
                    ...(form.responsibilities ? form.responsibilities : []),
                  ];
                  arr[i] = e.target.value;
                  change("responsibilities", arr);
                }}
                placeholder={`Responsibility ${i + 1}`}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  change(
                    "responsibilities",
                    form.responsibilities?.filter((_, idx) => idx !== i)
                  )
                }
                className="text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            change("responsibilities", [
              ...(form.responsibilities ? form.responsibilities : []),
              "",
            ])
          }
          className="w-full border border-dashed border-zinc-600 rounded-lg px-3 py-2 text-gray-400 hover:text-gray-300 focus:outline-none"
        >
          + Add Responsibility
        </button>
      </fieldset>

      {/* Actions */}
      <div className="pt-6 border-t border-zinc-700 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-zinc-600 rounded-lg text-gray-300 hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
        >
          {initialJob ? "Save Changes" : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
