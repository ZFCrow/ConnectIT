import { z } from 'zod'
import { Role } from '@/contexts/AuthContext';

/* 🔹 Common Account Type */
export type Account = {
  accountId: number;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: Role;
  isDisabled: boolean;
  profilePicUrl?: string;
}

/* 🔹 Common Account Schema */
export const AccountSchema = z.object({
  accountId: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required"),
  passwordHash: z.string(),
  passwordSalt: z.string(),
  role: z.nativeEnum(Role),
  isDisabled: z.boolean(),
  profilePicUrl: z.string().url().optional()
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
  bio: z.string().optional(),
  portfolioUrl: z.string().url().nullable().optional()
});

export type ValidatedUser = z.infer<typeof UserSchema>;

/* 🔹 Company Type + Schema */
export type Company = Account & {
  companyId: number;
  description?: string;
  location?: string;
  verified: boolean;
};

export const CompanySchema = AccountSchema.extend({
  companyId: z.number().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  verified: z.boolean()
});

export type ValidatedCompany = z.infer<typeof CompanySchema>;