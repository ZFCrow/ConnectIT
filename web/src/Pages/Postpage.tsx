import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { usePostContext } from "@/contexts/PostContext";
import { useEffect, useState } from "react";
import Postcard from "@/components/Postcard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import type { Post } from "@/type/Post";

const Postpage = () => {
  const { id: postID } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { allPosts, handleDeletePost, postToDelete, confirmDelete, cancelDelete, selectedViolations, setSelectedViolations } = usePostContext();

  const idNum = postID ? Number(postID) : NaN;
  if (isNaN(idNum)) return <Navigate to="/" replace />;

  // Priority: first try to grab post passed via navigation state, otherwise look it up
  const statePost = (location.state as { post?: Post })?.post;
  const post = statePost ?? allPosts.find((p) => p.id === idNum);

  // If there's no relevant post (deleted or never existed), redirect
  useEffect(() => {
    if (!post) {
      navigate("/", { replace: true });
    }
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="flex w-full gap-20 h-[calc(100vh-5rem)]">
      <div className="ml-3 flex-1">
        <Postcard
          post={post}
          detailMode
          onHide={() => {}}
          onDelete={() => handleDeletePost(post.id)}
          onDeleteComment={() => {}}
        />
      </div>

      <aside className="w-72 flex-shrink-0 sticky top-20 overflow-y-auto scrollbar-hide">
        <FullHeightVerticalBar />
      </aside>

      <PostDeleteDialog
        isOpen={postToDelete === post.id}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        selectedViolations={selectedViolations}
        onViolationChange={setSelectedViolations}
      />
    </div>
  );
};

export default Postpage;
