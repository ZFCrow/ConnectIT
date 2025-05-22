import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { StyledCard } from '@/components/Card'; 
import Postcard from '@/components/Postcard';
import { mockPosts } from '@/components/FakeData/mockPosts';

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

  useEffect( ()=> {
    api
    .get<Response>('/hello')
    .then( (res: AxiosResponse<Response>)  => {
      console.log(res.data) 
      setMessage(res.data.message)
      console.log('API:', res.data.status)
    })
    .catch ((err: AxiosError) => {
      console.log('APIERROR:', err.message)
    })
    
  

  }, []);
  return (
    <>
    <div className='flex flex-col text-center'>
      <h1>Message from Flask: </h1>
      <p> {message || "loading..."} </p>
     
      
      {posts.map( (p,i) => (
        <Postcard key={i} {...p}/>
      ))
    }
    </div>

 
    </>
  )
}

export default Homepage  