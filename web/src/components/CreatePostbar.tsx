import { 
    Card,
} from "@/components/ui/card"
import {useState } from "react";
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
import { usePostContext } from "@/contexts/PostContext";

import type {Label} from "@/type/Label"; // import the Label type 
import {FC }  from "react"; // import FC from react 
import type { Post } from "@/type/Post"; // import the Post type 

import { LabelPicker } from "./LabelPicker";
import { create } from "domain";

// createpostbar props 
type CreatePostbarProps = { 
    // You can add props here if needed
    retrievedTags: Label[]; // optional prop to pass all tags 
    createPostFunction?: (postData : { title: string; content: string; labels: number[] }) => Promise<any>; // optional function to create a post
    onPostCreated?: (post: Post) => void;
} 


const CreatePostbar  : FC<CreatePostbarProps> = ({ 
    retrievedTags, 
    createPostFunction ,
    onPostCreated = () => {}, // default to empty function if not provided 
 }) => { 

    const { createPostLoading } = usePostContext(); // get the post context 


    const [title, setTitle] = useState("What's on your mind?");
    //const [allTags , setAllTags] = useState<Label[]>([]); // all the tags fetched from the server
    const [selectedTags, setSelectedTags] = useState<Label[]>([]); // selected tags by the user 
    const [content , setContent] = useState(""); 
    const [open, setOpen] = useState(false); // dialog open state

    const handlePostSubmit = async () => {
        try {
            // Prepare the post data
            const postData = { 
                title: title, 
                content: content, 
                labels: selectedTags.map(tag => tag.labelId), // map selected tags to their IDs 
            }; 
            // If a custom createPostFunction is provided, use it 
            if (createPostFunction) { 
                const response = await createPostFunction(postData); 
                
                if (response.success) {
                    // If the post was created successfully, call the onPostSubmit callback
                    // onPostSubmit(title, content, selectedTags);
                    setTitle("What's on your mind?"); // reset the title 
                    setContent(""); // reset the content 
                    setSelectedTags([]); // reset the selected tags 
                    
                    // 
                    if (onPostCreated) {
                        onPostCreated(response.post); // call the onPostCreated callback with the new post 
                    }

                    setOpen(false); // close the dialog
                } 
            } else {
                console.log ("No createPostFunction provided."); 
                
            } 


                
        } catch (error) {
            console.error("Error creating post:", error);
            // Handle error appropriately, e.g., show a notification or alert 
        }
    }

    return (
    <Card className="flex flex-row items-center gap-4 p-4 h-20">

        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>

        <Dialog open ={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Input 
                readOnly
                value={title || "What's on your mind?"}
                className="flex-1 cursor-text text-left"
                />

                
            </DialogTrigger>
            
            <DialogContent>
                {
                    createPostLoading ? (
                <DialogHeader> 
                    <DialogTitle>please wait...</DialogTitle> 
                    <DialogDescription>
                        Your post is being created, please wait.
                    </DialogDescription> 
                </DialogHeader> 
                    ) : (

                   <>
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

                        <Textarea 
                            placeholder="What's on your mind?" 
                            value ={content} 
                            onChange={(e) => setContent(e.target.value)} 
                        /> 

                        <LabelPicker
                            allLabels={retrievedTags}
                            selected={selectedTags}
                            onChange={setSelectedTags}
                        />


                    </div>

                    <DialogFooter>
                        <Button 
                            type="submit"
                            onClick={handlePostSubmit}>Post</Button>
                    </DialogFooter>
                    </>

                    )
                }
            

            </DialogContent>
        </Dialog>


    </Card>
    )
}

export default CreatePostbar; 