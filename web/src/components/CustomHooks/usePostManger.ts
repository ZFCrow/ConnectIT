import { use, useEffect, useState } from 'react';
import type { Post } from '@/type/Post';
import type { Label } from '@/type/Label';
import type { Comment } from '@/type/Comment'; 
import { PostsArraySchema, ValidatedPost } from '@/type/Post'; 
import {  set, z } from 'zod'; 

import { api } from '@/api/api'; // import the api instance 
import { useAuth } from '@/contexts/AuthContext'; // import the auth context
import { create } from 'domain';
import { useViolationManager } from './useViolationManager';

export const usePostManager = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [recentlyInteractedPost, setRecentlyInteractedPost] = useState<Post[]>([]); // state to hold the most recent posts interacted by the user 
  const [activeFilter, setActiveFilter] = useState<string | null>(null); 
  const [activeSortby, setActiveSortBy] = useState<string | null>(null); 
  
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // loading state for fetching posts 
  const [deletePostLoading, setDeletePostLoading] = useState<boolean>(false); // loading state for deleting posts 
  const [createPostLoading, setCreatePostLoading] = useState<boolean>(false); // loading state for creating posts



  const { accountId } = useAuth(); // get the accountId from the auth context 

  const { 
    allViolations, 
    fetchViolations,
    selectedViolations,
    setSelectedViolations ,
  } = useViolationManager(); // get the violations from the violation manager 
  
  useEffect(() => { 
    fetchViolations(); // fetch the violations on mount 
  }, []); // empty dependency array to run only once on mount 
  
  
  const fetchPosts = async () => { 
    try{
      setLoading(true); // set loading to true while fetching posts
      const response = await api.get('/posts'); 
      console.log("Fetched post:", response.data); 
      // validate an array of posts 
      const validatedPosts: ValidatedPost[] = PostsArraySchema.parse(response.data); 

      // convert the validated posts to posts 
      const convertedPosts: Post[] = validatedPosts.map((post) => ({ 
        id : post.id, 
        username: post.username, 
        date: post.date, 
        labels: post.labels.map((label): Label => ({
          labelId: label.labelId, 
          name: label.name, 
          color: label.color,
        })), 
        title: post.title, 
        content: post.content, 
        comments: post.comments.map((comment): Comment => ({ 
          accountId: comment.accountId, 
          createdAt: comment.createdAt, 
          commentId: comment.commentId, 
          username: comment.username, 
          content: comment.content, 
          displayPicUrl: comment.displayPicUrl ? comment.displayPicUrl : undefined, // optional field 
        })), 
        likes: post.likes, 
        liked: post.liked ?? false, // default to false if not provided 
        accountId: post.accountId, // ensure accountId is included 
        displayPicUrl: post.displayPicUrl ? post.displayPicUrl : undefined, // optional field 
      })); 

      setAllPosts(convertedPosts); // set the posts state with validated posts
      setFilteredPosts(convertedPosts); // also set the filtered posts state
      setLoading(false); // set loading to false after fetching posts 
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
      } else {
        console.error("Error fetching posts:", error);
      }
      
    }
  }


  useEffect(() => {
    let result = [...allPosts]; // start with all posts 

    //apply active filter if any 
    if (activeFilter) {
      result = result.filter((post) => 
        post.labels.some((label) => label.name === activeFilter)
      );
    } 

    // apply active sort if any 
    if (activeSortby){
      if (activeSortby === "Most Recent") {
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (activeSortby === "Most Liked") {
        result.sort((a, b) => b.likes - a.likes);
      } else if (activeSortby === "Most Commented") {
        result.sort((a, b) => b.comments.length - a.comments.length);
      } 
    }
    setFilteredPosts(result); // update the filtered posts state 
  }, [allPosts, activeFilter, activeSortby]); // re-run when these change 


  // figure out recently itneracted post - recently commented 
  // check all post and check with comment.accountId === accountId 
  // then take out the recent 3 with the createdat 
  useEffect(() => {
    const recentPosts = allPosts
      .filter((post) => post.comments.some((comment) => comment.accountId === accountId))
      // give this post a temporary "date" field based on the most recent comment date by the user 
      .map((post) => ({
        ...post,
        recentlyInteractedDateTime: post.comments
          .filter((comment) => comment.accountId === accountId)
          .reduce((latest, comment) => {
            const commentDate = new Date(comment.createdAt);
            return commentDate > latest ? commentDate : latest;
          }, new Date(0)), // start with the earliest date
      })) 
      //.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .sort((a, b) => b.recentlyInteractedDateTime.getTime() - a.recentlyInteractedDateTime.getTime()) // sort by the most recent comment date 
      .slice(0, 5); // get the most recent 5 posts with comments by the user
    
    
    if (recentPosts.length > 0) {
      setRecentlyInteractedPost(recentPosts); // set the most recent post
    } else {
      setRecentlyInteractedPost(null); // no recent posts found
    }
  }, [allPosts, accountId]); // re-run when allPosts or accountId changes



  //Function to create a new post 
  const createPost = async (postData :{
    title: string;
    content: string; 
    labels: number[]; // array of label IDs 
  }) :  Promise<any> => { 

    try{
      setCreatePostLoading(true); // set loading to true while creating post 
      console.log("Creating post with data:", postData);

      const response = await api.post('/createPost', {
        accountId: accountId, // use the accountId from the auth context
        postData: postData, // pass the post data 
      });

      if (response.status === 201) { 
        // create a new post object based on the response data 
        //! not validated yet, so make sure the response data matches the Post type 
        const newPost: Post = {
          id: response.data.id, // assuming the response contains the new post ID
          username: response.data.username,
          date: response.data.date,
          labels: response.data.labels.map((label: Label) => ({
            labelId: label.labelId,
            name: label.name,
            color: label.color,
          })),
          title: postData.title,
          content: postData.content,
          comments: [],
          likes: 0,
          liked: false, // default to false
          accountId: accountId, // use the accountId from the auth context
          displayPicUrl: response.data.displayPicUrl ? response.data.displayPicUrl : undefined, // optional field
        };
        setAllPosts((prevPosts) => [...prevPosts, newPost]);
        setFilteredPosts((prevPosts) => [...prevPosts, newPost]); // also update filtered posts 
        console.log("Post created successfully:", newPost);
        return {success : true, post: newPost}; // return success and the new post 

       } else {
        console.error("Failed to create post:", response.statusText); }

  } catch (error) {
      console.error("Error creating post:", error);
  }
    finally {
      setCreatePostLoading(false); // set loading to false after creating post 
    }
};

  // FUNCTION TO toggle likes 
  const toggleLikePost = async (postId: number) => {
    try {
      const response = await api.post(`/toggleLikes/${postId}/${accountId}`); // send a post request to like the post
      if (response.status === 200) {
        setAllPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, liked: !post.liked } : post
          )
        );
        console.log("Post liked/unliked successfully:", response.data);
      } else {
        console.error("Failed to toggle like:", response.statusText);
      } 
    } catch (error) { 
      console.error("Error toggling like:", error);
    
  }
} 


  // function to create comment 
  const createComment = async (
    postId: number, 
    commentContent: { 
      content: string;
      postId: number; 
    }) => {
    try {
      const response = await api.post(`/comment/${postId}`, {
        accountId: accountId, // use the accountId from the auth context
        comment: commentContent, // pass the comment }
      }); 
      if (response.status === 201) {
        const newComment: Comment = {
          accountId: accountId, // use the accountId from the auth context
          createdAt: response.data.createdAt,
          commentId: response.data.commentId,
          username: response.data.username,
          content: commentContent.content,
          displayPicUrl: response.data.displayPicUrl ? response.data.displayPicUrl : undefined, // optional field
        };
        setAllPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
          )
        );
        console.log("Comment created successfully:", newComment); 
      }
    } catch (error) { 
      console.error("Error creating comment:", error);
    } 
  }


  const handleDeletePost = (postID: number) => {
    setPostToDelete(postID);
  };


  const confirmDelete = async () => { 
    if (postToDelete) {
      setDeletePostLoading(true); // set loading to true while deleting post 
      const listofViolationsID : number[] = selectedViolations.map((violation) => violation.violationId); // get the list of violation IDs from selected violations 
      console.log("List of violations to send:", listofViolationsID); 
      try {
        // navigate 

        //setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
        //setFilteredPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
        

        const response = await api.post(`/post/${postToDelete}`, {
          accountId: accountId, // use the accountId from the auth context
      
          data: { violations: listofViolationsID }, // send the selected violations
        });

        if (response.status === 200) {
          setPostToDelete(null);


          if (selectedViolations.length > 0) {
            console.log("Post deleted with violations:", selectedViolations);
            setSelectedViolations([]);
          }  else {
            console.log("Post deleted without violations"); 
          }
          
         
        } else {
          console.error("Failed to delete post:", response.statusText);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
      finally { 
        setDeletePostLoading(false); // set loading to false after deleting post 
      } 
    }
  } 

  const cancelDelete = () => {
    setPostToDelete(null);
    setSelectedViolations([]);
  };



  const handleDeleteComment = async (commentId: number) => { 
    console.log("delete comment with ID:", commentId); 
    try {
      const response = await api.post(`/deleteComment/${commentId}`,{
        accountId: accountId, // use the accountId from the auth context
      }); // send a delete request to delete the comment 
      if (response.status === 200) {
        setAllPosts((prevPosts) =>
          prevPosts.map((post) => ({
            ...post,
            comments: post.comments.filter((comment) => comment.commentId !== commentId),
          }))
        );
        console.log("Comment deleted successfully with ID:", commentId);
      } else {
        console.error("Failed to delete comment:", response.statusText);
      } 
    } catch (error) { 
      console.error("Error deleting comment:", error);
    }
  } 

  const handleHide = (postId: number) => {
    // setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setFilteredPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId)); 
  }


  return {
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
    allViolations,
    loading,
    setLoading,
    toggleLikePost,
    createComment, 
    recentlyInteractedPost, // expose the recently interacted post state
    deletePostLoading, // expose the delete post loading state 
    createPostLoading, // expose the create post loading state
  }
};