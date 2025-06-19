import { useState } from "react";
import axios from "axios";

// This hook provides a loading state and a function to call when you want to delete
export function useDeleteJob(onSuccess?: (jobId: number) => void) {
  const [loading, setLoading] = useState(false);

  const deleteJob = async (jobId: number) => {
    setLoading(true);
    try {
      await axios.post(`/api/deleteJob/${jobId}`);
      if (onSuccess) onSuccess(jobId);
      // Optionally, you can also show a toast here
    } catch (err) {
      alert("Failed to delete job. Please try again.\n" + err);
    } finally {
      setLoading(false);
    }
  };

  return { deleteJob, loading };
}
