import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import type { JobApplication } from "../type/JobApplicationSchema";

// Returns loading states and handlers. Optionally takes a setState callback for local applicants update.
export function useApplicantActions(
  setLocalApplicants?: React.Dispatch<React.SetStateAction<JobApplication[]>>
) {
  const [acceptLoadingId, setAcceptLoadingId] = useState<number | null>(null);
  const [rejectLoadingId, setRejectLoadingId] = useState<number | null>(null);

  const handleAccept = async (applicationId: number) => {
    setAcceptLoadingId(applicationId);
    try {
      await axios.post(`/api/approveApplication/${applicationId}`);
      if (setLocalApplicants) {
        setLocalApplicants((prev) =>
          prev.map((app) =>
            app.applicationId === applicationId
              ? { ...app, status: "Accepted" }
              : app
          )
        );
      }
      toast.success("Applicant accepted!");
    } catch (err) {
      toast.error("Failed to accept applicant.");
      console.error("Accept error:", err);
    } finally {
      setAcceptLoadingId(null);
    }
  };

  const handleReject = async (applicationId: number) => {
    setRejectLoadingId(applicationId);
    try {
      await axios.delete(`/api/rejectApplication/${applicationId}`);
      if (setLocalApplicants) {
        setLocalApplicants((prev) =>
          prev.map((app) =>
            app.applicationId === applicationId
              ? { ...app, status: "Rejected" }
              : app
          )
        );
      }
      toast.success("Applicant rejected/removed.");
    } catch (err) {
      toast.error("Failed to reject applicant.");
      console.error("Reject error:", err);
    } finally {
      setRejectLoadingId(null);
    }
  };

  return {
    acceptLoadingId,
    rejectLoadingId,
    handleAccept,
    handleReject,
  };
}
