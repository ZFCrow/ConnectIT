import { mockPosts } from "@/components/FakeData/mockPosts";
import { useParams, Navigate } from "react-router-dom";
import Postcard from "@/components/Postcard";
import FullHeightVerticalBar from "@/components/FullHeightVerticalBar"; 

const Postpage = () => { 
    // Get postID from URL parameters
    const { postID } = useParams<{ postID: string }>();
    console.log('Postpage loaded with ID:', postID); 


    // 2) Convert to number (or bail if it’s not present or NaN)
    const idNum = postID ? Number(postID) : NaN;
    if (isNaN(idNum)) {
        return <Navigate to="/" replace />;
    }
    
    // 3) Lookup by numeric id
    const post = mockPosts.find((p) => p.id === idNum);
    if (!post) {
        return <p className="text-center text-gray-500">Post not found.</p>;
    }


    return (


      <div className='flex w-full gap-20'>
        
        <div className="ml-3 flex-1">
            <Postcard {...post} detailMode={true} />
        </div>
        
        {/* Right sidebar - fixed width */}
        <div className='w-100 flex-shrink-0 border-1'>
          <FullHeightVerticalBar
            userId = {1} 
          /> 
          
        </div>
      </div>


    );
}

export default Postpage; 