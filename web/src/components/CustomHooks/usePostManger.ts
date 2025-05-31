import { useState } from 'react';
import type { Post } from '@/type/Post';

export const usePostManager = (initialPosts: Post[]) => {
  const [posts, setPosts] = useState(initialPosts);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);

  const handleDeletePost = (postID: number) => {
    setPostToDelete(postID);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
      setPostToDelete(null);
      setSelectedViolations([]);
      console.log("Post deleted with violations:", selectedViolations);
    }
  };

  const cancelDelete = () => {
    setPostToDelete(null);
    setSelectedViolations([]);
  };

//   const handleViolationChange = (violation: string, checked: boolean) => {
//     if (checked) {
//       setSelectedViolations(prev => [...prev, violation]);
//     } else {
//       setSelectedViolations(prev => prev.filter(v => v !== violation));
//     }
//   };

  const handleDeleteComment = (commentId: number) => {
    console.log("Delete comment with ID:", commentId);
    // TODO: Implement comment deletion logic
    // filter it out from the post's comments 
    setPosts((prevPosts) =>
      prevPosts.map((post) => ({
        ...post,
        comments: post.comments.filter((comment) => comment.commentId !== commentId),
      }))
    );
    console.log("Comment deleted with ID:", commentId);
  };

  const handleHide = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  return {
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
  };
};