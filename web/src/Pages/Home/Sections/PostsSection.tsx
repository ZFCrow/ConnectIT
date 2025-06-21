import { useEffect } from "react";
import { Pagination } from "@/components/ui/pagination";
import Postcard from "@/components/Postcard";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import { usePostContext } from "@/contexts/PostContext";
import { Post } from "@/type/Post";
import { Button } from "@/components/ui/button";


const PostsSection = () => { 
    const {
        allPosts,
        isLoadingPosts,
        postsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = usePostContext();

    
    // Initial loading skeleton
    if (isLoadingPosts && allPosts.length === 0) {
        return (
        <div className="flex flex-col gap-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
        </div>
        );
    }

    if (postsError)    return <p>Error loading posts.</p>;

    return (
        <div className="flex flex-col gap-4">
            {allPosts.map((post) => (
                <Postcard key={post.id} postId={post.id}/>
            ))}

            {hasNextPage && (
                <Button
                    onClick={() => fetchNextPage()}  
                    disabled={isFetchingNextPage}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                         {isFetchingNextPage ? 'Loading more…' : 'Load more'}
                </Button>
            )}
        </div>
    );
}

export default PostsSection; 