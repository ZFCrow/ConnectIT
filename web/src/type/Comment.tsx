import { z } from 'zod'; 

export type Comment = {
    accountId: number;
    commentId: number;  
    createdAt: string; // ISO date string 
    username: string;
    content: string; 
    displayPicUrl?: string; 
}


export const CommentSchema = z.object({
    accountId: z.number(),
    createdAt: z.string(), // ISO date string
    commentId: z.number(), 
    username: z.string(), 
    content: z.string(),
    displayPicUrl: z.string().url().optional(), // Optional URL for the display picture 
})