// src/utility/useApplyJob.ts
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

type ApplyJobOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useApplyJob(opts: ApplyJobOptions = {}) {
  const [applicationLoading, setLoading] = useState(false);

  const applyJob = async (jobId: number, userId: number, file?: File) => {
    setLoading(true);
    try {
      // Prepare form data if sending a file
      const formData = new FormData();
      const jsonData = JSON.stringify({
        jobId,
        userId,
      });
      formData.append("userId", String(userId));
      formData.append("jobId", String(jobId));

      //   if (file) formData.append("resume", file);

      await axios.post(`/api/applyJob`, jsonData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(
        "Your application is in!\nThe company may contact you soon! Best of luck 🍀"
      );
      opts.onSuccess?.();
    } catch (err) {
      toast.error("Failed to apply for job. Try again!");
      console.error("Error applying for job:", err.response.data);
      opts.onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return { applyJob, applicationLoading };
}
