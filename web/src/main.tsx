import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom' 
import { ThemeProvider } from './components/theme-provider.tsx'
import { AuthProvider } from '@/contexts/AuthContext.tsx' 
import { PostProvider } from './contexts/PostContext.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./utility/axiosConfig.tsx";

const queryClient = new QueryClient(); 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <AuthProvider>
     <QueryClientProvider client={queryClient}>
    <PostProvider>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
    <BrowserRouter>
    <App/>
    </BrowserRouter>  
    </ThemeProvider> 
    </PostProvider>
    </QueryClientProvider>
  </AuthProvider>
  </StrictMode>,
)
