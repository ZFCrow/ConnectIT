import Homepage from "@/Pages/Homepage";
import { Routes, Route, Link } from "react-router-dom";
import Otherpage from "@/Pages/Otherpage";
import Register from "@/Pages/auth/Register";
import Login from "@/Pages/auth/Login";
import Navbar from "./components/Navbar";
import JobListingPage from "./Pages/JobListing";
import JobDetailPage from "./Pages/JobDetails";

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
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/jobListing" element={<JobListingPage />} />
            <Route path="/jobDetails/:jobId" element={<JobDetailPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
