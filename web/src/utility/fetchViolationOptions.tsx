import axios from "@/utility/axiosConfig";

// Type for a violation option
export interface ViolationOption {
  violationId: number;
  description: string;
}

/**
 * Fetch all violation options from the API.
 * @returns Promise<ViolationOption[]>
 * @throws If the API call fails.
 */
export async function fetchViolationOptions(): Promise<ViolationOption[]> {
  try {
    const res = await axios.get("/api/getAllViolations");
    // Assumes API returns: [{ violationId, description }, ...]
    return res.data as ViolationOption[];
  } catch (err) {
    console.error("Failed to fetch violation options:", err);
    throw err;
  }
}
