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
import PendingApprovalPage from "./Pages/PendingApprovalPage";
import RoleGuard from "./RoleGuard";

const ProtectedRoutes = () => {
  const { role, isLoading, verified } = useAuth();

  if (isLoading) {
    return <div>Loading session...</div>;
  }

  // if role undefined , bring them to login

  if (role == null) {
    return <Navigate to="/login" replace />;
  }
  if (role === Role.Company && !verified) {
    return <PendingApprovalPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/post/:postId" element={<Postpage />} />

      <Route path="/profile/:viewId" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfilePage />} />
      <Route path="/jobListing" element={<JobListingPage />} />
      <Route path="/jobDetails/:jobId" element={<JobDetailPage />} />
      <Route
        path="/myJobs"
        element={
          <RoleGuard allowed={[Role.User]}>
            <MyJobsPage />
          </RoleGuard>
        }
      />
      <Route
        path="/company/recruitmentDashboard"
        element={
          <RoleGuard allowed={[Role.Company]}>
            <CompanyJobsPage />
          </RoleGuard>
        }
      />
      <Route
        path="/company/jobForm/:jobId?"
        element={
          <RoleGuard allowed={[Role.Company]}>
            <CreateEditJobPage />
          </RoleGuard>
        }
      />
      <Route
        path="/companyVerification"
        element={
          <RoleGuard allowed={[Role.Admin]}>
            <CompanyVerificationPage />
          </RoleGuard>
        }
      />
      <Route
        path="/pendingApproval"
        element={
          <RoleGuard allowed={[Role.Company]}>
            <PendingApprovalPage />
          </RoleGuard>
        }
      />
    </Routes>
  );
};

export default ProtectedRoutes;
