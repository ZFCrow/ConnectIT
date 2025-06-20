import { useEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import Postcard from "@/components/Postcard";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import { usePostContext } from "@/contexts/PostContext";


const PostsSection = () => { 
    const {
        fetchPosts,
        filteredPosts,
        loading,
        currentPage,
        totalPages,
        setCurrentPage
    } = usePostContext(); // custom hook to manage posts 