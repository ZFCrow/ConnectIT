import { z } from "zod";
import { Role } from "@/contexts/AuthContext";

/* 🔹 Common Account Type */
export type Account = {
  accountId: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isDisabled: boolean;
  profilePicUrl?: string;
  twoFaEnabled: boolean; 
  twoFaSecret?: string | null; 
};

/* 🔹 Common Account Schema */
export const AccountSchema = z.object({
  accountId: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required"),
  passwordHash: z.string(),
  role: z.nativeEnum(Role),
  isDisabled: z.boolean(),
  twoFaEnabled: z.boolean(),
  twoFaSecret: z.string().nullable().optional(),
  profilePicUrl: z.string().url().nullable().optional(),
});

export type ValidatedAccount = z.infer<typeof AccountSchema>;

/* 🔹 User Type + Schema */
export type User = Account & {
  userId: number;
  bio?: string;
  portfolioUrl?: string;
};

export const UserSchema = AccountSchema.extend({
  userId: z.number().optional(),
  bio: z.string().nullable().optional(),
  portfolioUrl: z.string().url().nullable().optional(),
});

export type ValidatedUser = z.infer<typeof UserSchema>;

/* 🔹 Company Type + Schema */
export type Company = Account & {
  companyId: number;
  description?: string;
  location?: string;
  verified: 0 | 1 | 2;
  companyDocUrl: string;
};

export const CompanySchema = AccountSchema.extend({
  companyId: z.number().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  verified: z.number(),
  companyDocUrl: z.string().url(),
});

export type ValidatedCompany = z.infer<typeof CompanySchema>;

export function getCompanyStatus(
  verified: 0 | 1 | 2
): "Pending" | "Verified" | "Rejected" {
  switch (verified) {
    case 1:
      return "Verified";
    case 2:
      return "Rejected";
    case 0:
    default:
      return "Pending";
  }
}
