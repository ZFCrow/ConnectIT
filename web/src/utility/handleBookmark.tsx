import axios from "axios";

// Generic type T for your JobListing type
export const handleBookmarkToggle = async <
  T extends { jobId: number; isBookmarked: boolean }
>(
  userId: number,
  jobId: number,
  isBookmarked: boolean,
  setJobListings?: React.Dispatch<React.SetStateAction<T[]>>
) => {
  const optimisticUpdate = (prev: T[] | T) => {
    if (Array.isArray(prev)) {
      // Update job in the array
      return prev.map((job) =>
        job.jobId === jobId ? { ...job, isBookmarked: !isBookmarked } : job
      );
    } else if (prev && typeof prev === "object") {
      // Update single job object
      if ((prev as T).jobId === jobId) {
        return { ...prev, isBookmarked: !isBookmarked };
      }
      return prev;
    }
    return prev;
  };

  try {
    setJobListings(optimisticUpdate as any); // React will call with prev value

    if (isBookmarked) {
      await axios.delete(`/api/removeBookmark/${userId}/${jobId}`);
    } else {
      await axios.post(`/api/addBookmark`, { userId, jobId });
    }
  } catch (err) {
    // Roll back UI if API fails
    setJobListings(optimisticUpdate as any);

    console.error("Failed to toggle bookmark:", err);
  }
};
