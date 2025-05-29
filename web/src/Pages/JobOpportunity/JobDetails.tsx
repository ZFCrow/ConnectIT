import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { sampleJobs } from "../../components/FakeData/sampleJobs";
import JobDetailsCard from "../../components/JobOpportunity/JobDetailsCard";
import { jobListingRoute } from "@/components/JobOpportunity/SharedConfig";
import { ApplicationToaster } from "@/components/JobOpportunity/ResumeUploadModal";
import { useAuth } from "@/contexts/AuthContext";
export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const job = sampleJobs.find((j) => j.jobId === Number(jobId));
  const { role, userId, companyId } = useAuth();
  if (!job) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <Link to={jobListingRoute} className="text-blue-500 hover:underline">
          ← Back to listings
        </Link>
        <div className="mt-6 text-center text-gray-400">Job not found.</div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <Link
        to={
          role === "company" ? "/company/recruitmentDashboard" : "/jobListing"
        }
        className="
          inline-flex items-center space-x-1
          text-s font-medium
          text-gray-300 bg-zinc-800
          px-2 py-1 rounded
          hover:bg-gray-700 hover:text-white
          transition-colors
          -mt-2
          mb-2  
        "
      >
        <ArrowLeft className="w-3 h-3" />
        <span>Back to Listing</span>
      </Link>
      {/* Job details in a card */}
      <JobDetailsCard job={job} userType={!role ? "" : role} />
      <ApplicationToaster />{" "}
    </div>
  );
}
