import Homepage from "@/Pages/Homepage";
import { Routes, Route, Link } from "react-router-dom";
import Otherpage from "@/Pages/Otherpage";
import Register from "@/Pages/auth/Register";
import Login from "@/Pages/auth/Login";
import ProfilePage from "@/Pages/Profile";
import EditProfilePage from "./Pages/EditProfile";
import Navbar from "./components/Navbar";
import JobListingPage from "./Pages/JobOpportunity/JobListing";
import JobDetailPage from "./Pages/JobOpportunity/JobDetails";
import Postpage from "@/Pages/Postpage";

import {
  jobDetailsRoute,
  jobListingRoute,
  applicationRoute,
} from "@/components/JobOpportunity/SharedConfig";
import MyJobsPage from "./Pages/JobOpportunity/SavedJob";
import CompanyJobsPage from "./Pages/JobOpportunity/CompanyJobPage";
import CreateEditJobPage from "./Pages/JobOpportunity/CreateEditJobPage";
function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col gap-2 bg-amber-50 text-black dark:bg-zinc-900 dark:text-slate-100 transition-colors ">
        <Navbar />

        <main className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/post/:postID" element={<Postpage />} />
            <Route path="/otherpage" element={<Otherpage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/edit" element={ <EditProfilePage /> } />
            <Route path="/jobListing" element={<JobListingPage />} />
            <Route path="/jobDetails/:jobId" element={<JobDetailPage />} />
            <Route path="/myJobs" element={<MyJobsPage />} />
            <Route
              path="/company/recruitmentDashboard"
              element={<CompanyJobsPage />}
            />
            <Route
              path="/company/jobForm/:jobId?"
              element={<CreateEditJobPage />}
            />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
