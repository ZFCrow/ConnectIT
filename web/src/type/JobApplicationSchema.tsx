import { z } from "zod";

export const JobApplicationSchema = z.object({
  applicationId: z.number(),
  appliedAt: z.string(), // Optionally: z.coerce.date() if you want a Date
  bio: z.string().nullable().optional(),
  email: z.string().email(),
  jobId: z.number(),
  name: z.string(),
  resumeURL: z.string().url(),
  status: z.enum(["Applied", "Accepted", "Rejected"]),
  userId: z.number(),
  profilePicUrl: z.string().url().nullable().optional(), // Optional profile picture URL
  accountId: z.number().nullable().optional(), // Optional account ID
});

export type JobApplication = z.infer<typeof JobApplicationSchema>;
