import { useState, useEffect } from "react";
import axios from "axios";
import Postcard from "@/components/Postcard";
import CreatePostbar from "@/components/CreatePostbar";
import ListingCard from "@/components/listingCard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { PopularTags } from "@/components/FakeData/PopularTags";
import { Role, useAuth } from "@/contexts/AuthContext";
import { usePostContext } from "@/contexts/PostContext";
import { useLabelManager } from "@/components/CustomHooks/useLabelManager";
import { create } from "domain";

const Homepage = () => {
  const { accountId, role, userId, companyId } = useAuth();

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
    createPost,
    postToDelete,
    selectedViolations,
    handleDeletePost,
    confirmDelete,
    cancelDelete,
    setSelectedViolations,
    handleDeleteComment,
    handleHide,
  } = usePostContext(); // custom hook to manage posts
  

  const {
    allLabels,
    setAllLabels,
    popularLabels,
    fetchLabels,
  } = useLabelManager(); // custom hook to manage labels
  

  useEffect(() => {
    fetchPosts(); // fetch the posts on mount
    fetchLabels(); // fetch the labels on mount s
  }, []);

  return (
    <>
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left sidebar - fixed width */}
        <aside className="w-64 flex-shrink-0 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <ListingCard
            title="Popular Tags"
            listofitems={popularLabels.map ((label) => label.name)}
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
          {role !== Role.Admin && <CreatePostbar retrievedTags={allLabels} createPostFunction={createPost}/>}
          
          {filteredPosts.map((p) => {
            return (
              <Postcard
                key={p.id}
                post={p}
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
        />
      </div>
    </>
  );
};

export default Homepage;
