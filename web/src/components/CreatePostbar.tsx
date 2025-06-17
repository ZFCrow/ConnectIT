import { 
    Card,
} from "@/components/ui/card"
import { useEffect, useState } from "react";
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
import axios from "axios";

import type {Label} from "@/type/Label"; // import the Label type 
import { Role ,useAuth } from "@/contexts/AuthContext";
const CreatePostbar = () => { 


    const [title, setTitle] = useState("What's on your mind?");
    const [allTags , setAllTags] = useState<Label[]>([]); // all the tags fetched from the server
    const [selectedTags, setSelectedTags] = useState<Label[]>([]); // selected tags by the user 
    const [content , setContent] = useState(""); 
    const { accountId, role } = useAuth(); // get the accountId and role from the auth context 

    // api to send the post to the server 
    const api = axios.create({
        baseURL: "/api",
    }); 

    useEffect(() => {
        const fetchLabels = async () => {
            try{
                const res = await api.get('/labels'); 
                console.log("Fetched labels:", res.data); 

                //validation if needed 
                setAllTags(res.data); // set the labels to the state 
            }
            catch (error) { 
                console.error("Error fetching labels:", error);
            } 
        }
        fetchLabels(); // fetch the labels on mount 
    }, []); // empty dependency array to run only once on mount

    const handlePostSubmit = async () => {
        try {
                const response = await api.post('/createPost', {
                    accountId : accountId, 
                    postData : {
                        title: title,
                        content: content,
                        labels: selectedTags.map(tag => tag.labelId), // send the selected tags as an array of strings
                    }
                })
                // Here you would typically send the post data to your API
                console.log("Post submitted:", { title, content, selectedTags });
                // Reset the form after submission
                setTitle("What's on your mind?");
                setContent("");
                setSelectedTags([]);
        } catch (error) {}
    }

    return (
    <Card className="flex flex-row items-center gap-4 p-4 h-20">

        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>

        <Dialog>
            <DialogTrigger asChild>
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

                    <Textarea 
                        placeholder="What's on your mind?" 
                        value ={content} 
                        onChange={(e) => setContent(e.target.value)} 
                    /> 

                    <OptionBox
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                    />


                </div>

                <DialogFooter>
                    <Button 
                        type="submit"
                        onClick={handlePostSubmit}>Post</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


    </Card>
    )
}

export default CreatePostbar; 