import Homepage from '@/Pages/Homepage'
import { Routes, Route, Link } from "react-router-dom";
import Otherpage from '@/Pages/Otherpage' 

function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Homepage/>} /> 
      <Route path='/otherpage' element={<Otherpage/>} /> 
    </Routes>
    </>
  )
}

export default App
