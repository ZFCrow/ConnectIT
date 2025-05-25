import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";


import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"


import type { FC } from "react"; 
// Mock data imports
import { mockAppliedJobs } from "@/components/FakeData/MockAppliedJobs";
import { mockRecentChats } from "@/components/FakeData/MockRecentChats";
import { mockRecentPostsLikes } from "@/components/FakeData/MockRecentPosts";

import { useNavigate } from "react-router-dom";

export interface FullHeightVerticalBarProps {
    userId : number; 
}


const FullHeightVerticalBar: FC<FullHeightVerticalBarProps> = (
    { userId} 
) => {
    // Convert userID to number 
    const userIdNum = Number(userId); 
    const appliedJobs = mockAppliedJobs.filter((job) => job.userId === userIdNum);
    const recentChats = mockRecentChats.filter((chat) => chat.userId === userIdNum);
    const recentPosts = mockRecentPostsLikes.filter((post) => post.userId === userIdNum);
    const navigate = useNavigate(); 

    return (
        <ScrollArea className="h-screen p-4">
            <Accordion type="multiple" className="space-y-4 ">

                <AccordionItem value="applied">
                    <AccordionTrigger>📄 Recently Applied Job</AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-2 text-sm">
                            {appliedJobs.map( (job) => (
                                <li key={job.jobId}>
                                    {job.title} @ {job.companyName} 
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="chats">
                    <AccordionTrigger>💬 Recent Chats</AccordionTrigger>
                    <AccordionContent>
                    <ul className="space-y-2 text-sm">
                        {recentChats.map((chat) => (
                        <Card key={chat.chatId} className="shadow-sm border">
                            <CardContent className="p-3">
                            <div className="font-semibold">{chat.companyName}</div>
                            <div className="text-muted-foreground text-sm truncate">
                                {chat.lastMessage}
                            </div>
                            </CardContent>
                        </Card>
                        ))}

                    </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="posts">
                    <AccordionTrigger>👍 Recent Interactions</AccordionTrigger>
                    <AccordionContent>
                    <ul className="space-y-2 text-sm">
                        {/* {recentPosts.map((post) => (
                        <li onClick = {() => navigate(`/post/${post.postId}`)}
                        key={post.postId}>{post.title}</li>
                        ))} */}

                        {recentPosts.map((post) => (
                        <Card key={post.postId} 
                                className="hover:bg-muted transition cursor-pointer" 
                                onClick={() => navigate(`/post/${post.postId}`)}>
                            <CardContent className="p-3">
                            <div className="font-medium">{post.title}</div>
                            <div className="text-muted-foreground text-xs mt-1">
                                Click to view post
                            </div>
                            </CardContent>
                        </Card>
                        ))}
                    </ul>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </ScrollArea>
    )
} 

export default FullHeightVerticalBar; 