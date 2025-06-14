import { z }  from 'zod';

export type User = {
    userId: number;
    name: string;
    email: string;
    bio?: string;
    profilePicUrl?: string;
    portfolioUrl?: string
    accountId: number;
}

export const UserSchema = z.object({
    userId: z.number(),
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required"),
    bio: z.string().optional().default(""),
    profilePicUrl: z.string().url().optional(),
    portfolioUrl: z.string().url().optional(),
    accountId: z.number()
})

export type ValidatedUser = z.infer<typeof UserSchema>