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
        DropdownMenuItem,
        DropdownMenuTrigger, 
    } from "@/components/ui/dropdown-menu";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"

import { Badge } from "@/components/ui/badge";
import type { FC } from "react";


import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 

import { ChevronUp, MessageSquare, ThumbsUp, MoreVertical, Flag, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button"; 

type Comment = {
    user: string;
    content: string; 
}

// Define valid colors as a type union
type ValidColor = 'red' | 'blue' | 'green' | 'gray' | 'purple' | 'pink' | 'orange' | 'yellow' | 'lime';

type Label ={
    name: string;
    color: ValidColor; 
}

export type PostProps = {
  user: string;
  date: string;
  labels: Label[]; 
  title: string;
  content: string;
  comments: Comment[];
};





const Postcard: FC<PostProps> = ({user,date,labels,title,content,comments}) => { 

    const colorMap: Record<ValidColor, string> = {
        red: "border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
        blue: "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
        green: "border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
        gray: "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white",
        purple: "border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white",
        pink: "border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white",
        orange: "border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white",
        yellow: "border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white",
        lime: "border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-white",
    };

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3">

                    {/* row section with the avatar, posttitle with the dropdown at the other side */}
                    <div className="flex items-center justify-between w-full">

                        <div className="flex items-center space-x-3">

                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" alt={user} />
                                <AvatarFallback>{user[0]}</AvatarFallback>
                            </Avatar>

                            <div>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription className="mt-1 text-sm text-muted-foreground flex flex-col items-start gap-2">
                                    {/* date on its own line */}
                                    <span className="text-xs">{date}</span>
                                </CardDescription>
                            </div>
                        </div>

                        <div>
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
                        </div>

                    </div>


                    {/* badges section right under the postTitle and avatar  */}
                    <div>
                        {labels.map( (label, i) => (
                            <Badge key={i} variant="outline" className={`
                                px-2 py-1
                                text-sm
                                rounded-full                                
                                transition-colors duration-200
                                ${colorMap[label.color] || colorMap.gray}
                                 `
                        
                            }>
                                {label.name}
                            </Badge>))}
                    </div>
                
                </div>
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