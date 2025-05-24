import React from "react";
import { Link } from "react-router-dom";
import type { JobListing } from "../../type/jobListing";
import { Calendar } from "lucide-react";
import { dateLocale, dateFormatOptions } from "./SharedConfig";

interface Props {
  job: JobListing;
}
const JobDetailsCard: React.FC<Props> = ({ job }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-4">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          {job.title}
        </h1>
        <div className="flex items-start gap-1 text-sm text-gray-300">
          <span>
            Posted On{" "}
            {new Date(job.createdAt).toLocaleDateString(
              dateLocale,
              dateFormatOptions
            )}
          </span>
        </div>
      </div>{" "}
      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
        <span>
          <b className="text-gray-400">Company:</b> {job.companyName}
        </span>
        <span>
          <b className="text-gray-400">Location:</b>
          {job.companyAddress}
        </span>
        <span>
          <b className="text-gray-400">Type:</b> {job.type}
        </span>
        <span>
          <b className="text-gray-400">Work Arr.:</b> {job.workArrangement}
        </span>
        <span>
          <b className="text-gray-400">Salary:</b> $
          {job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}
        </span>
      </div>
      <h2 className="text-xl font-semibold text-gray-200">Job Description</h2>
      <p className="text-gray-200 whitespace-pre-line">{job.description}</p>
      <h2 className="text-xl font-semibold text-gray-200">
        Roles and Responsibility
      </h2>
      <ul className="list-disc pl-6 text-gray-200">
        {job.responsibilities?.map((role, index) => (
          <li key={index} className="mb-2">
            {role}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center space-x-4">
        <Link
          to="#"
          className="
      bg-green-500 hover:bg-green-600 text-white font-medium
      px-6 py-2 rounded-xl transition
    "
        >
          Apply Now
        </Link>

        <div className="inline-flex items-center space-x-1 bg-zinc-800 text-gray-300 text-sm font-medium px-2.5 py-1 rounded-lg">
          <Calendar className="w-4 h-4" />
          <time dateTime={job.applicationDeadline}>
            by{" "}
            {new Date(job.applicationDeadline).toLocaleDateString(
              dateLocale,
              dateFormatOptions
            )}
          </time>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsCard;
