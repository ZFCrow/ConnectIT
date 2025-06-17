import { useEffect, useState } from 'react';
import type { Post } from '@/type/Post';
import type { Label } from '@/type/Label';
import type { Comment } from '@/type/Comment'; 
import { PostsArraySchema, ValidatedPost } from '@/type/Post'; 
import {  z } from 'zod'; 

import axios from 'axios'; 

export const usePostManager = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null); 
  const [activeSortby, setActiveSortBy] = useState<string | null>(null); 
  
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const handleDeletePost = (postID: number) => {
    setPostToDelete(postID);
  };

  const api = axios.create({
    baseURL: "/api",
    });

  const fetchPosts = async () => { 
    try{
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
      } else {
        console.error("Error fetching posts:", error);
      }
      
    }
  }

  useEffect(() =>{
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

  const confirmDelete = () => {
    if (postToDelete) {
      setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== postToDelete));
      setFilteredPosts(allPosts); 
      setPostToDelete(null);
      setSelectedViolations([]);
      console.log("Post deleted with violations:", selectedViolations);
    }
  };

  const cancelDelete = () => {
    setPostToDelete(null);
    setSelectedViolations([]);
  };


  const handleDeleteComment = (commentId: number) => {
    console.log("Delete comment with ID:", commentId);
    // TODO: Implement comment deletion logic
    // filter it out from the post's comments 
    setAllPosts((prevPosts) =>
      prevPosts.map((post) => ({
        ...post,
        comments: post.comments.filter((comment) => comment.commentId !== commentId),
      }))
    );
    console.log("Comment deleted with ID:", commentId);
  };

  const handleHide = (postId: number) => {
    setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };


  

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