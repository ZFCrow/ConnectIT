export type Applicant = {
  applicantId: number;
  jobId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: "Applied" | "Shortlisted" | "Rejected";
  appliedAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  jobTitle?: string; // Optional, for convenience in listing
};
