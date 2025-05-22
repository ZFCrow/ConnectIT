import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"

import 
    {   
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuGroup,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuPortal,
        DropdownMenuSeparator,
        DropdownMenuShortcut,
        DropdownMenuSub,
        DropdownMenuSubContent,
        DropdownMenuSubTrigger,
        DropdownMenuTrigger, 
    } from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"


import type { FC } from "react";


import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 

import { ChevronUp, MessageSquare, ThumbsUp, MoreVertical, Flag, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button"; 

type Comment = {
    user: string;
    content: string; 
}
type PostProps = {
  user: string;
  date: string;
  labels: string[]; 
  title: string;
  content: string;
  comments: Comment[];
};

const Postcard: FC<PostProps> = ({user,date,labels,title,content,comments}) => { 
    return (
        <>
        <Card className="max-w-xl">
            <CardHeader className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt={user} />
                        <AvatarFallback>{user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription className="mt-1 text-sm text-muted-foreground flex flex-col items-start">
                            {/* date on its own line */}
                            <span className="text-xs">{date}</span>

                            {/* labels in a row, under the date */}
                            <div className="flex space-x-2 mt-1">
                                {labels.map((label, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-1 bg-gray-200 rounded-full text-xs font-semibold text-gray-700"
                                >
                                    {label}
                                </span>
                                ))}
                            </div>
                        </CardDescription>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>

                    {/* The pop-up menu */}
                    <DropdownMenuContent side="bottom" align="end" className="w-40">
                        <DropdownMenuItem onSelect={() => console.log("report")}>
                        <Flag/>Report
                        </DropdownMenuItem> 
                        <DropdownMenuItem onSelect={() => console.log("hide")}>
                        <EyeOff/>Hide
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>               

                
            </CardHeader>


            <CardContent>
          
                <p className="text-sm leading-relaxed">{content}</p>
            </CardContent>


            <CardFooter className="flex flex-col">
                <Collapsible className="w-full" defaultOpen={false}>
                    <div className="flex space-x-2 justify-end ">
                        <Button variant="ghost" size="sm">
                            <ThumbsUp className="mr-2 h-4 w-4" /> Like
                        </Button>

                        {/* Just the button, not the whole collapsible */}
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Comments ({comments.length})
                            </Button>
                        </CollapsibleTrigger>
                    </div>                        
                    

                    <CollapsibleContent className="space-y-3 pt-2">
                        {comments.map((c, i) => (
                            <div key={i} className="text-sm">
                            <strong>{c.user}:</strong> {c.content}
                            </div>
                        ))}

                        {/* optional add-comment UI */}
                        <div className="flex space-x-2 pt-2">
                            <input
                            className="flex-1 rounded border px-2 py-1"
                            placeholder="Add a comment…"
                            />
                            <Button size="sm">Post</Button>
                        </div>
                    </CollapsibleContent>

                </Collapsible>



                {/* <Button variant="ghost" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment
                </Button> */}
            </CardFooter>
    
        </Card>
        </>
    )
}

export default Postcard 