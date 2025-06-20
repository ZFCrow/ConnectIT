import { z } from 'zod'; 

export type Comment = {
    accountId: number;
    commentId: number;  
    createdAt: string; // ISO date string 
    username: string;
    content: string; 
    displayPicUrl?: string; 
}

export type CreateCommentDTO = { 
    content: string; // Content of the comment
    postId: number; // ID of the post to which the comment belongs
} 

export const CommentSchema = z.object({
    accountId: z.number(),
    createdAt: z.string(), // ISO date string
    commentId: z.number(), 
    username: z.string(), 
    content: z.string(),
    displayPicUrl: z.string().url().optional(), // Optional URL for the display picture 
})