import Homepage from '@/Pages/Homepage'
import { Routes, Route, Link } from "react-router-dom";
import Otherpage from '@/Pages/Otherpage' 
import Register from '@/Pages/auth/Register'
import Login from '@/Pages/auth/Login'
import Navbar from './components/Navbar';


function App() {
  return (
    <>
    <div className='min-h-screen flex flex-col bg-amber-50 text-black dark:bg-zinc-900 dark:text-slate-100 transition-colors'>
      <Navbar/> 

      <main className="flex-grow flex items-center justify-center px-4">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/otherpage" element={<Otherpage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </main>
    </div>

    </>
  )
}

export default App
