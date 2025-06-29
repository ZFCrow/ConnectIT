import axios from "@/utility/axiosConfig";
type MaybeBookmarked = {
  jobId?: number | null;
  isBookmarked?: boolean | null;
};
/** Generic job shape that has a bookmark flag */
export const handleBookmarkToggle = async <
  T extends MaybeBookmarked,
  // S can be ONE job, an ARRAY of jobs, or null
  S extends T | T[] | null
>(
  userId: number,
  jobId: number,
  isBookmarked: boolean,
  setState?: React.Dispatch<React.SetStateAction<S>>
) => {
  // -------- optimistic update --------
  const optimisticUpdate = (prev: S): S => {
    if (Array.isArray(prev)) {
      return prev.map((j) =>
        j.jobId === jobId ? { ...j, isBookmarked: !isBookmarked } : j
      ) as S;
    }
    if (prev && (prev as T).jobId === jobId) {
      return { ...prev, isBookmarked: !isBookmarked } as S;
    }
    return prev;
  };

  try {
    setState?.(optimisticUpdate);
    if (isBookmarked) {
      await axios.delete(`/api/removeBookmark/${userId}/${jobId}`);
    } else {
      await axios.post(`/api/addBookmark`, { userId, jobId });
    }
  } catch (err) {
    // rollback
    setState?.(optimisticUpdate);
    console.error("Failed to toggle bookmark:", err);
  }
};
