import { useState, useEffect } from 'react';
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { StyledCard } from '@/components/Card'; 


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
    <h1>Message from Flask</h1>
    <p> {message || "loading..."} </p>
    <StyledCard/>
    </>
  )
}

export default Homepage  