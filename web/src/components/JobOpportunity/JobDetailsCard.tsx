import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { JobListing } from "../../type/jobListing";
import { Calendar, Bookmark, Trash2, Edit2 } from "lucide-react";
import {
  dateLocale,
  dateFormatOptions,
  //   applicationRoute,
} from "./SharedConfig";
import { useMemo } from "react";
import ResumeUploadModal from "./ResumeUploadModal";
import { useState } from "react";
import ApplicantCard from "./ApplicantCard";
import type { Applicant } from "../../type/applicant";
import { sampleApplicants } from "../FakeData/sampleApplicants";
import { Role, useAuth } from "@/contexts/AuthContext";
import { useDeleteJob } from "@/utility/handleDeleteJob";
import DeleteJobModal from "./DeleteJobModal";
interface Props {
  job: JobListing;
  userType?: string; // Optional, if needed for user-specific logic
}
const JobDetailsCard: React.FC<Props> = ({ job, userType }) => {
  //for application modal
  const [open, setOpen] = useState(false);
  //for delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const { deleteJob, loading } = useDeleteJob(() => {
    setDeleteOpen(false);
    navigate("/company/recruitmentDashboard");

    window.location.reload();
  });
  const handleDeleteClick = () => setDeleteOpen(true);
  const handleDeleteConfirm = () => {
    deleteJob(job.jobId);
  };
  const { role, userId, companyId } = useAuth();
  const filteredApplicants = useMemo(() => {
    if (userType === Role.Company) {
      return sampleApplicants.filter((a) => a.jobId === job.jobId);
    }
    return [];
  }, [job.jobId, userType]);

  const decoratedApplicants = useMemo(
    () =>
      filteredApplicants.map((a) => ({
        ...a,
        jobTitle: job.title,
        jobId: job.jobId,
      })),
    [filteredApplicants, job.title, job.jobId]
  );
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const statusOptions = ["All", "Applied", "Shortlisted", "Rejected"];

  // 4️⃣ Filter decoratedApplicants by status
  const filteredApplicantsByStatus = decoratedApplicants.filter(
    (a) => statusFilter === "All" || a.status === statusFilter
  );
  return (
    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-6">
      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={(file: File) => {}}
        jobTitle={job.title}
        companyName={job.companyName}
      />
      {/* Header: Title + Field badge + Bookmark + Posted On */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {job.title}
            </h1>
            {userType === Role.User ? (
              <button
                aria-label="Save job"
                className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
              >
                <Bookmark className="w-6 h-6" />
              </button>
            ) : (
              userType === Role.Company ||
              (userType === Role.Admin && (
                <>
                  {/* <Link
                  to={`/company/jobForm/${job.jobId}`}
                  className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
                >
                  <Edit2 className="w-6 h-6" />
                </Link> */}

                  <button
                    aria-label="Delete job"
                    onClick={() => {
                      handleDeleteClick();
                      //TODO: Handle delete logic here
                    }}
                    className="
              p-1 rounded-full text-gray-400
              hover:bg-zinc-800 hover:text-white
              transition
            "
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                  <DeleteJobModal
                    open={deleteOpen}
                    onCancel={() => setDeleteOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    loading={loading}
                    jobTitle={job.title}
                  />
                </>
              ))
            )}
          </div>
          {/* Field badge */}
          <span
            className="
            inline-block
            bg-indigo-600 text-white text-xs font-semibold
            uppercase tracking-wide
            px-2 py-0.5 rounded
          "
          >
            {job.fieldOfWork}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-300">
          <Calendar className="w-5 h-5 text-gray-400" />
          <time dateTime={job.createdAt}>
            Posted on {new Date(job.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>{" "}
      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
        <span>
          <b className="text-gray-400">Company:</b> {job.company.name}
        </span>
        <span>
          <b className="text-gray-400">Location: </b>
          {job.company.location}
        </span>
        <span>
          <b className="text-gray-400">Type:</b> {job.jobType}
        </span>
        <span>
          <b className="text-gray-400">Work Arr.:</b> {job.workArrangement}
        </span>
        <span>
          <b className="text-gray-400">Salary:</b> $
          {job.minSalary.toLocaleString()}–${job.maxSalary.toLocaleString()}
        </span>
        {typeof job.yearsOfExperience === "number" &&
          job.yearsOfExperience > 0 && (
            <span className="flex items-center gap-1">
              <span>
                <b className="text-gray-400">Experience Preferred:</b>{" "}
                {`${job.yearsOfExperience} year(s)`}
              </span>
            </span>
          )}
        {/* <span>
          <b className="text-gray-400">Location: </b>
          {job.company.location}
        </span> */}
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
        {userType === Role.User && (
          <Link
            to=""
            onClick={() => setOpen(true)}
            className="
            bg-green-500 hover:bg-green-600 text-white font-medium
            px-6 py-2 rounded-xl transition
            "
          >
            Apply Now
          </Link>
        )}

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
      {userType === Role.Company && job.jobId === companyId && (
        <section className="mt-8">
          <hr className="mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Applicants</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-gray-100 rounded px-3 py-1 text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>{" "}
          <ul className="space-y-5">
            {filteredApplicantsByStatus.map((app) => (
              <ApplicantCard
                key={app.applicantId}
                applicant={app}
                onAccept={(id) => {
                  /* … */
                  //TODO : Handle accept logic here
                }}
                onDelete={(id) => {
                  /* … */
                  // TOOD: Handle delete logic here
                }}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default JobDetailsCard;
