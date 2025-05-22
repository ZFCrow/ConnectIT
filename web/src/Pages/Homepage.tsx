import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { StyledCard } from '@/components/Card'; 
import Postcard from '@/components/Postcard';
import CreatePostbar from '@/components/CreatePostbar';
import ListingCard from '@/components/listingCard';
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
  return (
    <>
    <div className='flex space-x-4 justify-between'>
      {/* <div>
        <h1>Message from Flask: </h1>
        <p> {message || "loading..."} </p>
      </div> */}

      {/* left component is probably a sort + filter bar */}
      <div className='flex flex-col gap-2'> 
        <ListingCard title="Popular Tags" listofitems={tags} onClick={() => {}}/>
        <ListingCard title="Sort by" listofitems={["Most Recent","Most Liked","Most Commented"]} onClick={() => {}}/> 
      </div>

      
      {/* middle component of creating post plus postcards */}
     <div className='flex gap-2 flex-col text-center'>
        <CreatePostbar/>
        {posts.map( (p,i) => (
          <Postcard key={i} {...p}/>
        ))}
     </div>

     {/* message section  */}
    </div>

 
    </>
  )
}

export default Homepage  