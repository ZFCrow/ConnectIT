import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Postcard from "@/components/Postcard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { usePostContext } from "@/contexts/PostContext";


const Postpage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const idNum = postId ? Number(postId) : NaN;



  
  const {
    useIndividualPost,
    postToDelete, // dialog state from context 
  } = usePostContext();

  // Replace your context lookup with the custom hook:
  const {
    post,
    isLoading: isLoadingPost,
    error: postError,
    refetch: refetchPost,
  } = useIndividualPost(idNum);

  const [isDeleted, setIsDeleted] = useState(false);



  // Redirect to “not found” if after loading there’s still no post
  useEffect(() => {
    if (!isLoadingPost && !post) {
      navigate("/", { replace: true });
    }
  }, [isLoadingPost, post, navigate]);


    
  if (isNaN(idNum)) {
    return <Navigate to="/" replace />;
  }

  
  return (
    <div className="flex w-full gap-20 h-[calc(100vh-5rem)]">
      <div className="ml-3 flex-1 overflow-y-auto scrollbar-hide">
        {isLoadingPost ? (
          <div className="text-center text-gray-500 mt-10">
            Loading post...
          </div>
        ) : postError ? (
          <div className="text-center text-red-500 mt-10">
            Error loading post.{" "}
            <button onClick={() => refetchPost()}>Retry</button>
          </div>
        ) : (
          <Postcard postId={idNum} detailMode />
        )}
      </div>

      <aside className="w-72 flex-shrink-0 sticky top-20 overflow-y-auto scrollbar-hide">
        <FullHeightVerticalBar />
      </aside>

      <PostDeleteDialog
        isOpen={postToDelete !== null} // dialog opens only if we have a post
        onDeleteSuccess={() => setIsDeleted(true)}
      />
    </div>
  );
};

export default Postpage;
