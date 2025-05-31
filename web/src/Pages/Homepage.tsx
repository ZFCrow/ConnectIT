import { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";

import Postcard from "@/components/Postcard";
import CreatePostbar from "@/components/CreatePostbar";
import ListingCard from "@/components/listingCard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import { mockPosts } from "@/components/FakeData/mockPosts";
import { PopularTags } from "@/components/FakeData/PopularTags";
import { useAuth } from "@/contexts/AuthContext"; 
import { usePostManager } from "@/components/CustomHooks/usePostManger";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


import OptionBox from "@/components/OptionBox";

interface Response {
  message: string;
  status: number;
}

// form the base url first
const api = axios.create({
  baseURL: "/api",
});

const Homepage = () => {
  const { accountId, role, userId, companyId } = useAuth(); 
  console.log("all URL:", import.meta.env.VITE_BACKEND_URL);
  const [message, setMessage] = useState<string>("");

  // const [posts, setPosts] = useState(mockPosts); // use the mock data for now
  const [tags, setTags] = useState(PopularTags); // use the mock data for now


  const {
    posts,
    setPosts,
    postToDelete,
    selectedViolations,
    handleDeletePost,
    confirmDelete,
    cancelDelete,
    setSelectedViolations,
    handleDeleteComment,
    handleHide,
  } = usePostManager(mockPosts);



  useEffect(() => {
    api
      .get<Response>("/test")
      .then((res: AxiosResponse<Response>) => {
        console.log(res.data);
        setMessage(res.data.message);
        console.log("API:", res.data.status);
        console.log("Message:", message);
      })
      .catch((err: AxiosError) => {
        console.log("APIERROR:", err.message);
      });
  }, []);

  const handleSortClick = (criterion: string) => {
    const sorted = [...posts];

    if (criterion === "Most Recent") {
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (criterion === "Most Liked") {
      sorted.sort((a, b) => b.likes - a.likes); // if likes exists
    } else if (criterion === "Most Commented") {
      sorted.sort((a, b) => b.comments.length - a.comments.length);
    }

    setPosts(sorted);
  };

  const handleFilterClick = (tag: string) => {
    const filteredPosts = mockPosts.filter((post) =>
      post.labels.some((label) => label.name === tag)
    );
    setPosts(filteredPosts);
  };

  const handleReset = (type: string) => {
    if (type === "filter") {
      setPosts(mockPosts); // Reset to original posts
    } else if (type === "sort") {
      setPosts(mockPosts); // Reset to original posts
    }
  };


  return (
    <>
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left sidebar - fixed width */}
        <aside className="w-64 flex-shrink-0 p-4 space-y-2">
          <ListingCard
            title="Popular Tags"
            listofitems={tags}
            onClick={handleFilterClick}
            onClickReset={handleReset}
            type="filter"
          />
          <ListingCard
            title="Sort by"
            listofitems={["Most Recent", "Most Liked", "Most Commented"]}
            onClick={handleSortClick}
            onClickReset={handleReset}
            type="sort"
          />
        </aside>

        {/* Middle content - grows to fill available space */}
        {/* Scrollabel content*/}

        <section className="flex-1 min-w-0 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
        {/* Only show CreatePostbar for non-admin users */}
          {role !== "admin" && <CreatePostbar />}
          {posts.map((p) => {
            return <Postcard key={p.id} {...p} 
                    onHide={handleHide}
                    onDelete={handleDeletePost}
                    onDeleteComment={handleDeleteComment}>
                    </Postcard>
          })}
        </section>

        {/* Right sidebar - fixed width */}
        <aside className="w-72 flex-shrink-0 p-4 overflow-y-auto scrollbar-hide">
          <FullHeightVerticalBar  />
        </aside>


        {/* Confirmation Dialog */}
        <PostDeleteDialog
          isOpen={postToDelete !== null}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          selectedViolations={selectedViolations}
          onViolationChange={setSelectedViolations}
        />
      </div>
    </>
  );
};

export default Homepage;
