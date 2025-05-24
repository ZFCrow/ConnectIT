import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

import Postcard from '@/components/Postcard';
import CreatePostbar from '@/components/CreatePostbar';
import ListingCard from '@/components/listingCard';
import FullHeightVerticalBar from '@/components/FullHeightVerticalBar';
import { mockPosts } from '@/components/FakeData/mockPosts';
import { PopularTags } from '@/components/FakeData/PopularTags';

// for the right side bar 
import { mockRecentChats } from '@/components/FakeData/MockRecentChats';
import { mockAppliedJobs } from '@/components/FakeData/MockAppliedJobs'; 
import { mockRecentPosts } from '@/components/FakeData/MockRecentPosts'; 



interface Response {
  message: string;  
  status: number; 
}

  // form the base url first 
const api = axios.create
  ({
    baseURL : '/api'
  });

  
const Homepage = () => {
  console.log('all URL:', import.meta.env.VITE_BACKEND_URL)

  const [message, setMessage] = useState<string>('');

  const [posts, setPosts] = useState(mockPosts); // use the mock data for now 
  const [tags, setTags] = useState(PopularTags); // use the mock data for now 

  const [appliedJobs, setAppliedJobs] = useState(mockAppliedJobs); 
  const [recentChats, setRecentChats] = useState(mockRecentChats); 
  const [recentPosts, setRecentPosts] = useState(mockRecentPosts);

  useEffect( ()=> {
    api
    .get<Response>('/test')
    .then( (res: AxiosResponse<Response>)  => {
      console.log(res.data) 
      setMessage(res.data.message)
      console.log('API:', res.data.status)
      console.log("Message:", message) 
    })
    .catch ((err: AxiosError) => {
      console.log('APIERROR:', err.message)
    })
    
  

  }, []);
  return (
    <>
      <div className='flex w-full gap-6'>
        {/* Left sidebar - fixed width */}
        <div className='w-64 flex-shrink-0 flex flex-col gap-2 mr-4 ml-4'> 
          <ListingCard title="Popular Tags" listofitems={tags} onClick={() => {}}/>
          <ListingCard title="Sort by" listofitems={["Most Recent","Most Liked","Most Commented"]} onClick={() => {}}/> 
        </div>
        
        {/* Middle content - grows to fill available space */}
        <div className='flex-1 flex gap-2 flex-col'>
          <CreatePostbar/>
          {posts.map((p,i) => (
            <Postcard key={i} {...p}/>
          ))}
        </div>
        
        {/* Right sidebar - fixed width */}
        <div className='w-100 flex-shrink-0 ml-4'>
          <FullHeightVerticalBar
            appliedJobs={appliedJobs}
            recentChats={recentChats}
            recentPosts={recentPosts}
          /> 
          
        </div>
      </div>
 
    </>
  )
}

export default Homepage  