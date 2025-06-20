import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JobForm } from "../../components/JobOpportunity/CreateUpdateJobForm";
import type { JobListing } from "../../type/jobListing";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import axios from "axios";

const CreateEditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(jobId);
  const existingJob = isEdit
    ? sampleJobs.find((j: JobListing) => j.jobId === Number(jobId)) || null
    : null;

  const handleSubmitPage = async (job: JobListing) => {
    // Construct backend payload to match backend keys and values
    const payload = {
      company_id: 1, //TODO: Replace with auth/context
      title: job.title,
      description: job.description,
      applicationDeadline: job.applicationDeadline,
      createdAt: job.createdAt,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      jobType: job.jobType, // Ensure matches backend expected enum value
      fieldOfWork: job.fieldOfWork, // Ditto here
      workArrangement: job.workArrangement,
      responsibilities: job.responsibilities,
      experiencePreferred: job.experiencePreferred ?? 0,
      isDeleted: false,
    };
    console.log("Submitting job payload:", payload);
    try {
      const response = await axios.post("/api/addJob", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Job created/updated:", response.data);
      // Optionally show a toast or success
      navigate(-1); // or wherever
    } catch (err) {
      // Handle error (show toast, set error state, etc)
      console.error("Failed to submit job:", err);
    }
  };

  return (
    <div className="w-4/5 mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Job Listing" : "Create New Job Listing"}
      </h1>
      <JobForm
        initialJob={existingJob}
        onSubmit={handleSubmitPage}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default CreateEditJobPage;
