import { z } from "zod";
import { JobApplicationSchema } from "./JobApplicationSchema";

export const JobTypeEnum = z.enum([
  "Part Time",
  "Full Time",
  "Internship",
  "Contract",
]);

export const WorkArrangementEnum = z.enum(["Onsite", "Remote", "Hybrid"]);

export const JobListingSchema = z.object({
  jobId: z.number(),
  title: z.string(),
  description: z.string(),
  applicationDeadline: z.string(), // ISO format date string
  minSalary: z.number(),
  maxSalary: z.number(),
  jobType: JobTypeEnum,
  createdAt: z.string(), // ISO format date string
  workArrangement: WorkArrangementEnum,
  fieldOfWork: z.string(),
  responsibilities: z.array(z.string()),
  experiencePreferred: z.number().optional(),
  isDeleted: z.boolean().optional(),
  company: z.any().optional(), // You can replace this with a stricter schema if needed
  jobApplication: z.array(JobApplicationSchema).optional(),
  numApplicants: z.number().optional(), // Number of applicants for the job
});
export const FrontendJobListingSchema = JobListingSchema.extend({
  isBookmarked: z.boolean().default(false),
  isApplied: z.boolean().default(false),
});

export type FrontendJobListing = z.infer<typeof FrontendJobListingSchema>;
export type JobListing = z.infer<typeof JobListingSchema>;
