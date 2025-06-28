import { useEffect } from "react";
import CreatePostbar from "@/components/CreatePostbar";
import ListingCard from "@/components/listingCard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { Role, useAuth } from "@/contexts/AuthContext";
import { usePostContext } from "@/contexts/PostContext";
import { useLabelManager } from "@/components/CustomHooks/useLabelManager";
import ListingCardSkeleton from "@/components/ListingCardSkeleton";
import PostsSection from "./Home/Sections/PostsSection";



const Homepage = () => {
  const { role } = useAuth();


    // New pagination context
  const {

    // filter & sort controls
    setActiveFilter,
    setActiveSortBy,

    // create/delete dialog state
    // createPost,
    postToDelete,
  } = usePostContext();



  const {
    allLabels,
    popularLabels,
    fetchLabels,
    loading: labelLoading
  } = useLabelManager(); // custom hook to manage labels
  

  useEffect(() => {
    fetchLabels(); // fetch the labels on mounts
  }, [fetchLabels]);

  return (
    <>
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left sidebar - fixed width */}
        {labelLoading ? (
          <aside className="w-64 flex-shrink-0 p-4 space-y-2 overflow-y-auto scrollbar-hide">
            <ListingCardSkeleton title = "Popular Tags" />
            <ListingCardSkeleton  title = "Sort by"/>
          </aside>
        ): (        
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
        </aside>)}


        {/* Middle content - grows to fill available space */}
        {/* Scrollabel content*/}

        <section className="flex-1 min-w-0 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
          {/* Only show CreatePostbar for non-admin users */}
          {/* {role !== Role.Admin && <CreatePostbar retrievedTags={allLabels} createPostFunction={createPost}/>} */}
           {role !== Role.Admin && <CreatePostbar retrievedTags={allLabels}/>}
          <PostsSection/>
        </section>

        {/* Right sidebar - fixed width */}
        <aside className="w-72 flex-shrink-0 p-4 overflow-y-auto scrollbar-hide">
          <FullHeightVerticalBar />
        </aside>

        {/* Confirmation Dialog */}
        <PostDeleteDialog
          isOpen={postToDelete !== null}
          //isOpen={false} 
        />
      </div>
    </>
  );
};

export default Homepage;
