import type { Label } from "@/type/Label"; 

export type Post = {
    id: number;
    user: string;
    date: string;
    labels: Label[]; 
    title: string;
    content: string;
    comments: Comment[];
    likes : number
    liked : boolean; // ✅ optional, with default = false  
    accountId : number;
};

type Comment = {
    accountId: number;
    commentId: number; 
    user: string;
    content: string; 
}