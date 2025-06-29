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

import { LabelPicker } from "./LabelPicker";
import { ApplicationToaster } from "@/components/CustomToaster";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

// createpostbar props
type CreatePostbarProps = {
  // You can add props here if needed
  retrievedTags: Label[]; // optional prop to pass all tags
};

const CreatePostbar: FC<CreatePostbarProps> = ({
  retrievedTags,
  // createPostFunction ,
  // onPostCreated = () => {}, // default to empty function if not provided
}) => {
  const { profilePicUrl, name } = useAuth(); // destructure profilePicUrl from the context
  const { createPost, createPostPending } = usePostContext(); // get the createPost function and status from the context
  const [open, setOpen] = useState(false); // dialog open state

  const [title, setTitle] = useState("What's on your mind? 123456");
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
      const raw = err.response?.data?.error;
      const message =
        typeof raw === "string"
          ? raw
          : typeof raw?.content === "string"
          ? raw.content
          : "Failed to create post, please try again.";

      toast.error(message); // ✅ always a primitive
      console.error("Failed to create post:", err);
    }
  };

  return (
    <>
      <Card className="flex flex-row items-center gap-4 p-4 h-20">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={
              profilePicUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
            }
          />
          <AvatarFallback>{name}</AvatarFallback>
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
