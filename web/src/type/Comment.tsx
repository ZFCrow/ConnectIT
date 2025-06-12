import { z } from 'zod'; 

export type Comment = {
    accountId: number;
    commentId: number; 
    username: string;
    content: string; 
    displayPicUrl: string; 
}


export const CommentSchema = z.object({
    accountId: z.number(),
    commentId: z.number(), 
    username: z.string(), 
    content: z.string(),
    displayPicUrl: z.string().url().optional(), // Optional URL for the display picture 
})