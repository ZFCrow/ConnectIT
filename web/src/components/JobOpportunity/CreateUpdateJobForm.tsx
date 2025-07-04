import React, { useState, useEffect, FormEvent } from "react";

import {
  JobTypeEnum,
  WorkArrangementEnum,
  type JobListing,
} from "../../type/jobListing";
import axios from "@/utility/axiosConfig";

// Static lists
const jobTypes = JobTypeEnum.options;
const arrangements = WorkArrangementEnum.options;

// Default empty job
const defaultJob = (): JobListing => ({
  jobId: Date.now(),
  title: "",
  fieldOfWork: "",
  description: "",
  jobType: jobTypes[0],
  workArrangement: arrangements[2],
  minSalary: 0,
  maxSalary: 0,
  createdAt: new Date().toISOString(),
  applicationDeadline: new Date().toISOString(),
  responsibilities: [""],
  experiencePreferred: 0,
  jobApplication: [],
});

interface JobFormProps {
  onSubmit: (job: JobListing) => void;
  onCancel: () => void;
}

export function JobForm({ onSubmit, onCancel }: JobFormProps) {
  const [form, setForm] = useState<JobListing>(defaultJob());
  // field specific setters for eslint
  const setTitle = (v: string) => setForm((s) => ({ ...s, title: v }));

  const setFieldOfWork = (v: string) =>
    setForm((s) => ({ ...s, fieldOfWork: v }));

  const setDescription = (v: string) =>
    setForm((s) => ({ ...s, description: v }));

  const setJobType = (v: JobTypeEnum) => setForm((s) => ({ ...s, jobType: v }));

  const setWorkArrangement = (v: WorkArrangementEnum) =>
    setForm((s) => ({ ...s, workArrangement: v }));

  const setMinSalary = (v: number) => setForm((s) => ({ ...s, minSalary: v }));

  const setMaxSalary = (v: number) => setForm((s) => ({ ...s, maxSalary: v }));

  const setExperiencePreferred = (v: number) =>
    setForm((s) => ({ ...s, experiencePreferred: v }));

  const setDeadline = (iso: string) =>
    setForm((s) => ({ ...s, applicationDeadline: iso }));

  const setResponsibilities = (arr: string[]) =>
    setForm((s) => ({ ...s, responsibilities: arr }));
  const [loading, setLoading] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get("/api/getFieldOfWork");
        // console.log("fieldOptions API result:", res.data);

        setFieldOptions(res.data);
      } catch (e) {
        setFieldOptions([]);
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
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
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="fieldOfWork"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Field
            </label>
            <select
              id="fieldOfWork"
              value={form.fieldOfWork}
              onChange={(e) => setFieldOfWork(e.target.value)}
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
          onChange={(e) => setDescription(e.target.value)}
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
              htmlFor="jobType"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Job Type
            </label>
            <select
              id="jobType"
              value={form.jobType}
              onChange={(e) => setJobType(e.target.value as JobTypeEnum)}
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
              onChange={(e) =>
                setWorkArrangement(e.target.value as WorkArrangementEnum)
              }
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
              min={0}
              value={form.minSalary === 0 ? "" : form.minSalary}
              onChange={(e) =>
                setMinSalary(e.target.value === "" ? 0 : +e.target.value)
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
              min={0}
              value={form.maxSalary === 0 ? "" : form.maxSalary}
              onChange={(e) =>
                setMaxSalary(e.target.value === "" ? 0 : +e.target.value)
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
            value={
              form.experiencePreferred === 0 ? "" : form.experiencePreferred
            }
            onChange={(e) => setExperiencePreferred(+e.target.value)}
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
          onChange={(e) => setDeadline(new Date(e.target.value).toISOString())}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
        />
      </fieldset>

      {/* Responsibilities */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-white">
          Responsibilities
        </legend>
        <div className="space-y-3">
          {form.responsibilities.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={r}
                onChange={(e) => {
                  const list = [...form.responsibilities];
                  list[i] = e.target.value;
                  setResponsibilities(list);
                }}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder={`Responsibility ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  const list = form.responsibilities.filter(
                    (_, idx) => idx !== i
                  );
                  setResponsibilities(list);
                }}
                className="flex-shrink-0 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setResponsibilities([...form.responsibilities, ""])}
          className="w-full border-dashed border-2 border-zinc-600 rounded-lg px-3 py-2 text-gray-400 hover:text-gray-300 transition"
        >
          + Add Responsibility
        </button>
      </fieldset>

      {/* Actions */}
      <div className="pt-6 border-t border-zinc-700 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg
            border-2
            border-zinc-500
            text-gray-300
            hover:bg-zinc-800
            hover:border-blue-500
            hover:text-white
            transition
            disabled:text-zinc-500
            disabled:border-zinc-700
            disabled:bg-transparent
            disabled:cursor-not-allowed
          `}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={`
            px-4 py-2 rounded-lg text-white
            bg-blue-600 hover:bg-blue-500
            disabled:bg-blue-400 disabled:text-zinc-200
            disabled:cursor-not-allowed
            transition
          `}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
