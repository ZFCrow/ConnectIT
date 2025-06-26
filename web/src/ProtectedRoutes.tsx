import { useAuth, Role } from "./contexts/AuthContext";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Homepage from "@/Pages/Homepage";
import Postpage from "@/Pages/Postpage";
import ProfilePage from "@/Pages/Profile";
import EditProfilePage from "./Pages/EditProfile";
import JobListingPage from "./Pages/JobOpportunity/JobListing";
import JobDetailPage from "./Pages/JobOpportunity/JobDetails";
import MyJobsPage from "./Pages/JobOpportunity/SavedJob";
import CompanyJobsPage from "./Pages/JobOpportunity/CompanyJobPage";
import CreateEditJobPage from "./Pages/JobOpportunity/CreateEditJobPage";
import CompanyVerificationPage from "./Pages/CompanyVerificationPage";
import { useNavigate } from "react-router-dom";
import PendingApprovalPage from "./Pages/PendingApprovalPage";

const ProtectedRoutes = () => {
  const { role, isLoading, verified } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // if role undefined , bring them to login

  console.log("ProtectedRoutes rendered, role:", role);

  if (role === null) {
    console.log("Role is undefined, redirecting to login...");
    return <Navigate to="/login" replace />;
  }
  if (role === Role.Company && !verified) {
    console.log(verified);
    console.log("Company not verified, redirecting to company verification...");
    return <Navigate to="/pendingApproval" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/post/:postId" element={<Postpage />} />

      <Route path="/profile/:viewId" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/jobListing" element={<JobListingPage />} />
      <Route path="/jobDetails/:jobId" element={<JobDetailPage />} />
      <Route path="/myJobs" element={<MyJobsPage />} />
      <Route
        path="/company/recruitmentDashboard"
        element={<CompanyJobsPage />}
      />
      <Route path="/company/jobForm/:jobId?" element={<CreateEditJobPage />} />
      <Route
        path="/companyVerification"
        element={<CompanyVerificationPage />}
      />
      <Route path="/pendingApproval" element={<PendingApprovalPage />} />
    </Routes>
  );
};

export default ProtectedRoutes;
