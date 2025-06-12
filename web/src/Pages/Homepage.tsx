import { useState, useEffect } from "react";
import axios from "axios";
import Postcard from "@/components/Postcard";
import CreatePostbar from "@/components/CreatePostbar";
import ListingCard from "@/components/listingCard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { mockPosts } from "@/components/FakeData/mockPosts";
import { PopularTags } from "@/components/FakeData/PopularTags";
import { Role, useAuth } from "@/contexts/AuthContext";
import { usePostManager } from "@/components/CustomHooks/usePostManger";
import { PostSchema, PostsArraySchema, ValidatedPost } from "@/type/Post";
import {z } from 'zod'; 


// form the base url first
const api = axios.create({
  baseURL: "/api",
});

const Homepage = () => {
  const { accountId, role, userId, companyId } = useAuth();

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

  //test the api call to call post/1 
  useEffect(() => {
    const fetchPosts = async () => { 
      try{
        const response = await api.get('/post/1'); 
        console.log("Fetched post:", response.data); 
        
        //* validate 
        const validatedPost : ValidatedPost = PostSchema.parse(response.data); 
        console.log("Validated post:", validatedPost); 

      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation error:", error.errors);
        } else {
          console.error("Error fetching posts:", error);
        }
        
      }
    }
    fetchPosts()
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
        <aside className="w-64 flex-shrink-0 p-4 space-y-2 overflow-y-auto scrollbar-hide">
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
          {role !== Role.Admin && <CreatePostbar />}
          {posts.map((p) => {
            return (
              <Postcard
                key={p.id}
                {...p}
                onHide={handleHide}
                onDelete={handleDeletePost}
                onDeleteComment={handleDeleteComment}
              ></Postcard>
            );
          })}
        </section>

        {/* Right sidebar - fixed width */}
        <aside className="w-72 flex-shrink-0 p-4 overflow-y-auto scrollbar-hide">
          <FullHeightVerticalBar />
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
