import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

import Postcard from '@/components/Postcard';
import CreatePostbar from '@/components/CreatePostbar';
import ListingCard from '@/components/listingCard';
import FullHeightVerticalBar from '@/components/FullHeightVerticalBar';
import { mockPosts } from '@/components/FakeData/mockPosts';
import { PopularTags } from '@/components/FakeData/PopularTags';



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

  const handleSortClick = (criterion: string) => {
    const sorted = [...posts];

    if (criterion === 'Most Recent') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (criterion === 'Most Liked') {
      sorted.sort((a, b) => b.likes - a.likes); // if likes exists
    } else if (criterion === 'Most Commented') {
      sorted.sort((a, b) => b.comments.length - a.comments.length);
    }

    setPosts(sorted);
  };

  const handleFilterClick = (tag: string) => { 
    const filteredPosts = mockPosts.filter(post => post.labels.some(label => label.name === tag));
    setPosts(filteredPosts);
  } 

  const handleReset = (type: string ) => { 
    if (type === 'filter') {
      setPosts(mockPosts); // Reset to original posts
    } else if (type === 'sort') {
      setPosts(mockPosts); // Reset to original posts
    } 
  }


  return (
    <>
      <div className='flex w-full gap-6'>
        {/* Left sidebar - fixed width */}
        <div className='w-64 flex-shrink-0 flex flex-col gap-2 mr-4 ml-4 sticky top-20 max-h-screen self-start'> 
          <ListingCard title="Popular Tags" listofitems={tags} onClick={handleFilterClick} onClickReset={handleReset} type='filter'/>
          <ListingCard title="Sort by" listofitems={["Most Recent","Most Liked","Most Commented"]} onClick={handleSortClick} onClickReset={handleReset} type='sort'/> 
        </div>
        
        {/* Middle content - grows to fill available space */}
        <div className='flex-1 flex gap-2 flex-col overflow-y-auto'>
          <CreatePostbar/>
          {posts.map((p) => {
            return <Postcard key={p.id} {...p}></Postcard>
            })}
        </div>
        
        {/* Right sidebar - fixed width */}
        <div className='w-100 flex-shrink-0 ml-4 sticky max-h-screen top-20'>
          <FullHeightVerticalBar userId={1}
          /> 
          
        </div>
      </div>
 
    </>
  )
}

export default Homepage  