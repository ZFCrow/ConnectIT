// components/PostCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <div className="post-card p-4 border rounded-lg">
      {/* ✅ Header skeleton - matches real header */}
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />  {/* Avatar */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />              {/* Username */}
          <Skeleton className="h-3 w-16" />              {/* Date */}
        </div>
      </div>
      
      {/* ✅ Title skeleton - matches real title */}
      <Skeleton className="h-6 w-3/4 mb-2" />
      
      {/* ✅ Content skeleton - matches real content */}
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      
      {/* ✅ Labels skeleton - matches real labels */}
      <div className="flex space-x-2 mb-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      
      {/* ✅ Actions skeleton - matches real actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-16" />               {/* Like button */}
        <Skeleton className="h-4 w-20" />               {/* Comments count */}
      </div>
    </div>
  );
};

export default PostCardSkeleton;