import { useState } from "react";
import axios from "@/utility/axiosConfig";
import toast from "react-hot-toast";

export function useDeleteJob(onSuccess?: (jobId: number) => void) {
  const [loading, setLoading] = useState(false);

  const deleteJob = async (jobId: number, violationId?: number) => {
    setLoading(true);
    try {
      if (violationId !== undefined && violationId !== null) {
        // Set violation reason first
        await axios.post(`/api/setViolation/${jobId}/${violationId}`);
      }
      // Proceed to delete job
      await axios.post(`/api/deleteJob/${jobId}`);
      toast.success("Job deleted successfully!");
      if (onSuccess) onSuccess(jobId);
      // Optionally, show a toast here
    } catch (err) {
      toast.error("Failed to delete job. Please try again.");
      alert("Failed to delete job. Please try again.\n" + err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteJob, loading };
}
