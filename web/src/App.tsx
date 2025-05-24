import Homepage from '@/Pages/Homepage'
import { Routes, Route, Link } from "react-router-dom";
import Otherpage from '@/Pages/Otherpage' 
import Navbar from './components/Navbar';


function App() {
  return (
    <>
    <div className=
          'min-h-screen flex flex-col gap-2 bg-amber-50 text-black dark:bg-zinc-900 dark:text-slate-100 transition-colors'
          >
      <Navbar/> 

      <main className="flex-grow flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/otherpage" element={<Otherpage />} />
        </Routes>
      </main>
    </div>

    </>
  )
}

export default App
