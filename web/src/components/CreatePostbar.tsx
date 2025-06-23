import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePostContext } from "@/contexts/PostContext";

import type { Label } from "@/type/Label"; // import the Label type
import { FC } from "react"; // import FC from react
import type { Post } from "@/type/Post"; // import the Post type

import { LabelPicker } from "./LabelPicker";
import { create } from "domain";
import { ApplicationToaster } from "@/components/CustomToaster";
import toast from "react-hot-toast";

// createpostbar props
type CreatePostbarProps = {
  // You can add props here if needed
  retrievedTags: Label[]; // optional prop to pass all tags
  // createPostFunction?: (postData : { title: string; content: string; labels: number[] }) => Promise<any>; // optional function to create a post
  // onPostCreated?: (post: Post) => void;
};

const CreatePostbar: FC<CreatePostbarProps> = ({
  retrievedTags,
  // createPostFunction ,
  // onPostCreated = () => {}, // default to empty function if not provided
}) => {
  const { createPost, createPostPending } = usePostContext(); // get the createPost function and status from the context
  const [open, setOpen] = useState(false); // dialog open state

  const [title, setTitle] = useState("What's on your mind?");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<Label[]>([]); // selected tags by the user

  const handlePostSubmit = async () => {
    try {
      await createPost({
        title,
        content,
        labels: selectedTags.map((l) => l.labelId),
      });
      // reset form
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to create post, please try again.";

      toast.error(message);
      console.error("Failed to create post:", err);
    }
  };

  return (
    <>
      <Card className="flex flex-row items-center gap-4 p-4 h-20">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
        </Avatar>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Input
              readOnly
              value={title || "What's on your mind?"}
              className="flex-1 cursor-text text-left"
            />
          </DialogTrigger>

          <DialogContent>
            {createPostPending ? (
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
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />

                  <LabelPicker
                    allLabels={retrievedTags}
                    selected={selectedTags}
                    onChange={setSelectedTags}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" onClick={handlePostSubmit}>
                    Post
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Card>
      <ApplicationToaster />{" "}
    </>
  );
};

export default CreatePostbar;
