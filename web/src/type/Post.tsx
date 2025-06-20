import type { Label  } from "@/type/Label"; 
import type { Comment} from "@/type/Comment";
import { z } from 'zod'; 
import { LabelSchema } from "@/type/Label";
import { CommentSchema } from "@/type/Comment"; 


export type Post = {
    id: number;
    username: string;
    date: string;
    labels: Label[]; 
    title: string;
    content: string;
    comments: Comment[];
    //likes : number
    //liked? : boolean; // ✅ optional, with default = false  
    likedBy ?: number[]; // Array of user IDs who liked the post 
    accountId : number;
    displayPicUrl?: string; // Optional URL for the display picture 
};

//! zod schema for Post 

export const PostSchema = z.object({
    id: z.number(),
    username: z.string(),
    date: z.string(), // ISO date string
    labels: z.array(LabelSchema), // Array of Label objects
    title: z.string(), // Title of the post
    content: z.string(), // Content of the post 
    comments: z.array(CommentSchema), // Array of Comment objects
    //likes: z.number().int().nonnegative(), // Non-negative integer for likes
    //liked: z.boolean().optional().default(false), // Optional boolean with default value false
    likedBy: z.array(z.number()).optional(), // Optional array of user IDs who liked the post 
    accountId: z.number(), // Account ID associated with the post
    displayPicUrl: z.string().url().optional(), // Optional URL for the display picture 
}); 

export type ValidatedPost = z.infer<typeof PostSchema>; 
export const PostsArraySchema = z.array(PostSchema); 


export type CreatePostDTO ={
    title: string;
    content: string;
    labels: number[];
}

export type DeletePostDTO = {
    postId: number;
    violations: number[]; // Array of violation IDs 
}; 