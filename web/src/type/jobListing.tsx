export type JobListing = {
  jobId: number;
  companyId: number;
  companyName?: string;
  companyAddress?: string;
  field?: string;
  workArrangement?: string;
  title: string;
  description: string;
  applicationDeadline: string;
  minSalary: number;
  maxSalary: number;
  type: string;
  createdAt: string;
  responsibilities?: string[];
  yearsOfExperience?: number;
  applied?: boolean;
  saved?: boolean;
};
