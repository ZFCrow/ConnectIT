import { z } from "zod";
import { JobApplicationSchema } from "./JobApplicationSchema";

export const JobTypeEnum = z.enum([
  "Part Time",
  "Full Time",
  "Internship",
  "Contract",
]);

export const WorkArrangementEnum = z.enum(["Onsite", "Remote", "Hybrid"]);

export const FieldEnum = z.enum([
  "UI/UX",
  "Software Engineering",
  "Data Science",
  "Cyber Security",
  "Cloud Engineering",
  "Product Management",
  "Business Analysis",
  "Project Management",
  "Mobile Development",
  "Web Development",
  "Network Engineering",
  "Game Development",
  "Quality Assurance",
  "DevOps",
  "Artificial Intelligence",
  "Machine Learning",
  "IT Support",
  "Database Administration",
  "Embedded Systems",
  "Blockchain",
  "Robotics",
  "Digital Marketing",
  "Graphic Design",
  "FinTech",
  "Sales Engineering",
  "Other",
]);

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
export type JobListing = z.infer<typeof JobListingSchema>;
