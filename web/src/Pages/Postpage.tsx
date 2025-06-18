import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { usePostContext } from "@/contexts/PostContext";
import { use, useEffect, useState } from "react";
import Postcard from "@/components/Postcard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import type { Post } from "@/type/Post";

const Postpage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  //const location = useLocation();
  const [isDeleted, setIsDeleted] = useState(false); 
  const { 
    allPosts, 
    postToDelete } = usePostContext();

  const idNum = postId ? Number(postId) : NaN;
  console.log("Post ID:", idNum);
  if (isNaN(idNum)) return <Navigate to="/" replace />;

  // Priority: first try to grab post passed via navigation state, otherwise look it up
  //const statePost = (location.state as { post?: Post })?.post;
  const post = allPosts.find((p) => p.id === idNum);

  useEffect(() => {
    // If the post is not found, redirect to home
    if (!post) {
      setIsDeleted(true); // Set isDeleted to true to trigger deletion state
    }
  }, [post]);

  useEffect(() => {
    // If the post is deleted, redirect to home
    if (isDeleted) {
      navigate("/", { replace: true });
    }
  }), [isDeleted, navigate];




  return (
    <div className="flex w-full gap-20 h-[calc(100vh-5rem)]">
      <div className="ml-3 flex-1 overflow-y-auto scrollbar-hide">
        <Postcard
          postId= {idNum} 
          detailMode
        />
      </div>

      <aside className="w-72 flex-shrink-0 sticky top-20 overflow-y-auto scrollbar-hide">
        <FullHeightVerticalBar />
      </aside>

      <PostDeleteDialog
        isOpen={postToDelete !== null} 
        onDeleteSuccess={() => setIsDeleted(true)} // Set isDeleted to true on successful deletion 
      />
    </div>
  );
};

export default Postpage;
