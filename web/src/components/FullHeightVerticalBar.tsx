import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import type { FC } from "react"; 

interface Job { jobId: string; title: string, companyName: string}
interface Chat { chatId: string; companyName: string; lastMessage: string }
interface Post { id: string; title: string; }

export interface FullHeightVerticalBarProps {
  appliedJobs:   Job[];
  recentChats:   Chat[];
  recentPosts:   Post[];
}


const FullHeightVerticalBar: FC<FullHeightVerticalBarProps> = (
    { appliedJobs, recentChats, recentPosts } 
) => {
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
                        <li key={chat.chatId}>
                            {chat.companyName}: {chat.lastMessage}
                        </li>
                        ))}
                    </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="posts">
                    <AccordionTrigger>👍 Recent Interactions</AccordionTrigger>
                    <AccordionContent>
                    <ul className="space-y-2 text-sm">
                        {recentPosts.map((post) => (
                        <li key={post.id}>{post.title}</li>
                        ))}
                    </ul>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </ScrollArea>
    )
} 

export default FullHeightVerticalBar; 