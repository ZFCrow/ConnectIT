// components/ListingCardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

interface ListingCardSkeletonProps {
  title: string;
  itemCount?: number;  // ✅ How many skeleton items to show
}

const ListingCardSkeleton = ({ title, itemCount = 5 }: ListingCardSkeletonProps) => {
  return (
    <div className="listing-card-skeleton p-4 border rounded-lg ">
      {/* Title - show real title */}
      <h3 className="font-semibold mb-3">{title}</h3>
      
      {/* Skeleton items */}
      <div className="space-y-2">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Skeleton 
            key={index}
            className="h-8 rounded"
            style={{ 
              width: `${Math.random() * 30 + 60}%`  // ✅ Random widths for variety
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingCardSkeleton;