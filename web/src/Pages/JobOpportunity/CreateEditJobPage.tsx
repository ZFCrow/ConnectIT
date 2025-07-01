import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { JobForm } from "../../components/JobOpportunity/CreateUpdateJobForm";
import type { JobListing } from "../../type/jobListing";
import axios from "@/utility/axiosConfig";
import { ApplicationToaster } from "@/components/CustomToaster";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

const CreateEditJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(jobId);

  const { companyId } = useAuth();

  const handleSubmitPage = async (job: JobListing) => {
    // Construct backend payload to match backend keys and values
    const payload = {
      company_id: companyId, //TODO: Replace with auth/context
      title: job.title,
      description: job.description,
      applicationDeadline: job.applicationDeadline,
      createdAt: job.createdAt,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      jobType: job.jobType, // Ensure matches backend expected enum value
      fieldOfWork: job.fieldOfWork, // Ditto here
      workArrangement: job.workArrangement,
      responsibilities: job.responsibilities?.filter(
        (r) => r !== null && r !== undefined && r.trim() !== ""
      ),
      experiencePreferred: job.experiencePreferred ?? 0,
      isDeleted: false,
    };
    // console.log("Submitting job payload:", payload);
    try {
      const response = await axios.post("/api/addJob", payload, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log("Job created/updated:", response.data);
      // Optionally show a toast or success
      navigate(-1); // or wherever
    } catch (err) {
      const errors = err?.response?.data?.error;

      if (errors && typeof errors === "object") {
        /* errors → { title: "Title cannot be empty", description: "Description …" } */

        Object.entries(errors).forEach(([field, message]) => {
          if (typeof message === "string") {
            toast.error(message, { id: `job-${field}` }); // id keeps one toast per field
          }
        });
      } else {
        toast.error(
          typeof errors === "string"
            ? errors
            : "Failed to create job listing, please try again."
        );
      }

      console.error("Failed to submit job:", err);
    }
  };

  return (
    <>
      <div className="w-4/5 mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? "Edit Job Listing" : "Create New Job Listing"}
        </h1>
        <JobForm onSubmit={handleSubmitPage} onCancel={() => navigate(-1)} />
      </div>
      <ApplicationToaster />{" "}
    </>
  );
};

export default CreateEditJobPage;
