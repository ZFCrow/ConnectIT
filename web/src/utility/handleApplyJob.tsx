// src/utility/useApplyJob.ts
import { useState } from "react";
import axios from "@/utility/axiosConfig";
import { toast } from "react-hot-toast";

type ApplyJobOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useApplyJob(opts: ApplyJobOptions = {}) {
  const [applicationLoading, setLoading] = useState(false);

  const applyJob = async (jobId: number, userId: number, file?: File) => {
    setLoading(true);
    let data: FormData | string;
    let headers: Record<string, string>;
    try {
      // Prepare form data if sending a file
      const formData = new FormData();
      formData.append("jobId", String(jobId));
      formData.append("userId", String(userId));
      formData.append("resume", file); // 👈 backend should expect "resume"
      data = formData;
      if (file) {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          toast.error("Resume must be a PDF file.");
          throw new Error("Invalid file type");
        }
      }
      //   if (file) formData.append("resume", file);

      await axios.post("/api/applyJob", data);

      toast.success(
        "Your application is in!\nThe company may contact you soon! Best of luck 🍀"
      );
      opts.onSuccess?.();
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to apply for job. Try again!";

      toast.error(message);
      console.error("Error applying for job:", err.response.data);
      opts.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { applyJob, applicationLoading };
}
