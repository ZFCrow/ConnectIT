import { useState, useEffect } from "react";
import axios from "axios";
import Postcard from "@/components/Postcard";
import CreatePostbar from "@/components/CreatePostbar";
import ListingCard from "@/components/listingCard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { PopularTags } from "@/components/FakeData/PopularTags";
import { Role, useAuth } from "@/contexts/AuthContext";
import { usePostManager } from "@/components/CustomHooks/usePostManger";
import { PostSchema, PostsArraySchema, ValidatedPost } from "@/type/Post";
import {set, z } from 'zod'; 
import { Post } from "@/type/Post"; 
import { Label } from "@/type/Label";
import { Comment } from "@/type/Comment";


// form the base url first
const api = axios.create({
  baseURL: "/api",
});

const Homepage = () => {
  const { accountId, role, userId, companyId } = useAuth();

  // const [posts, setPosts] = useState(mockPosts); // use the mock data for now
  const [tags, setTags] = useState(PopularTags); // use the mock data for now

  const {
    allPosts,
    setAllPosts,
    fetchPosts,
    filteredPosts,
    setFilteredPosts,
    activeFilter,
    setActiveFilter,
    activeSortby,
    setActiveSortBy, 
    postToDelete,
    selectedViolations,
    handleDeletePost,
    confirmDelete,
    cancelDelete,
    setSelectedViolations,
    handleDeleteComment,
    handleHide,
  } = usePostManager(); 
  
  
  const [allLabels , setAllLabels] = useState<Label[]>([]); // all the tags fetched from the server

  useEffect(() => {
    // fetch all labels
    const fetchLabels = async () => {
            try{
                const res = await api.get('/labels'); 
                console.log("Fetched labels:", res.data); 

                setAllLabels(res.data); // set the all tags state with the fetched labels
            }
            catch (error) { 
                console.error("Error fetching labels:", error);
            } 
        }
    fetchPosts()
    fetchLabels(); // fetch the labels on mount s
  }, []);

  return (
    <>
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left sidebar - fixed width */}
        <aside className="w-64 flex-shrink-0 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <ListingCard
            title="Popular Tags"
            listofitems={tags}
            onClick= {setActiveFilter}
          
          />
          <ListingCard
            title="Sort by"
            listofitems={["Most Recent", "Most Liked", "Most Commented"]}
            onClick={setActiveSortBy}
         
          />
        </aside>

        {/* Middle content - grows to fill available space */}
        {/* Scrollabel content*/}

        <section className="flex-1 min-w-0 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
          {/* Only show CreatePostbar for non-admin users */}
          {role !== Role.Admin && <CreatePostbar retrievedTags={allLabels} />}
          {filteredPosts.map((p) => {
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
