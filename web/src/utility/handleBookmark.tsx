import axios from "axios";

export const handleBookmarkToggle = async (
  userId: number,
  jobId: number,
  isBookmarked: boolean,
  setJobListings: React.Dispatch<React.SetStateAction<any[]>>
) => {
  try {
    // Update UI optimistically
    setJobListings((prev) =>
      prev.map((job) =>
        job.jobId === jobId ? { ...job, isBookmarked: !isBookmarked } : job
      )
    );
    if (isBookmarked) {
      await axios.delete(`/api/removeBookmark/${userId}/${jobId}`);
    } else {
      await axios.post(`/api/addBookmark`, { userId, jobId });
    }
  } catch (err) {
    setJobListings((prev) =>
      prev.map((job) =>
        job.jobId === jobId ? { ...job, isBookmarked: !isBookmarked } : job
      )
    );
    console.error("Failed to toggle bookmark:", err);
    // Optionally show an error notification here
  }
};
