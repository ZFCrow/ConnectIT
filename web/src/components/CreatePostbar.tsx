import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"
import { useState } from "react";
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import OptionBox from "@/components/OptionBox";
import { allTags } from "@/components/FakeData/PopularTags"; // import the full list of tags 

const CreatePostbar = () => { 
    const [title, setTitle] = useState("What's on your mind?");
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // default tags for the user


    return (
    <Card className="flex flex-row items-center gap-4 p-4 h-20">

        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>

        <Dialog>
            <DialogTrigger asChild>
                {/* <Button variant="outline" className="flex-1 cursor-text">
                    Create a post
                </Button> */}
                <Input 
                readOnly
                value={title || "What's on your mind?"}
                className="flex-1 cursor-text text-left"
                />

                
            </DialogTrigger>
            
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new post</DialogTitle>
                    <DialogDescription>
                        Share your thoughts with the community!
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Input 
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} />
                    <Textarea placeholder="What's on your mind?" /> 

                    <OptionBox
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                    />


                </div>

                <DialogFooter>
                    <Button type="submit">Post</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


    </Card>
    )
}

export default CreatePostbar; 