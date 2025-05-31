import { mockPosts } from "@/components/FakeData/mockPosts";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Postcard from "@/components/Postcard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar"; 
import { usePostManager } from "@/components/CustomHooks/usePostManger";
import PostDeleteDialog from "@/components/CustomDialogs/PostDeleteDialog";
import { useEffect, useState } from "react";

const Postpage = () => { 
    const navigate = useNavigate(); 
    const { postID } = useParams<{ postID: string }>();
    
    const idNum = postID ? Number(postID) : NaN;
    if (isNaN(idNum)) {
        return <Navigate to="/" replace />;
    }

    // Find the post first
    const foundPost = mockPosts.find((p) => p.id === idNum);
    
    // Handle not found case
    if (!foundPost) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                <p className="text-center text-gray-500">Post not found.</p>
            </div>
        );
    }

    // Use the hook with the found post
    const {
        posts,
        postToDelete,
        selectedViolations,
        handleDeletePost,
        confirmDelete,
        cancelDelete,
        setSelectedViolations,
        handleDeleteComment,
        handleHide,
    } = usePostManager([foundPost]);

    // Redirect when post is deleted
    useEffect(() => {
        if (posts.length === 0) {
            navigate("/", { replace: true });
        }
    }, [posts, navigate]);

    // // Get the current post from the posts array
    // const currentPost = posts && posts.length > 0 ? posts[0] : foundPost;

    return (
        <div className='flex w-full gap-20 h-[calc(100vh-5rem)]'>
            <div className="ml-3 flex-1">
                <Postcard 
                    {...foundPost} 
                    detailMode={true}
                    onDelete={handleDeletePost}
                    onDeleteComment={handleDeleteComment}
                    onHide={handleHide} 
                />
            </div>
            
            {/* Fixed width class */}
            <div className='w-72 flex-shrink-0 sticky top-20 overflow-y-auto scrollbar-hide'>
                <FullHeightVerticalBar/> 
            </div>

            <PostDeleteDialog
                isOpen={postToDelete !== null}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                selectedViolations={selectedViolations}
                onViolationChange={setSelectedViolations}
            />
        </div>
    );
}

export default Postpage;