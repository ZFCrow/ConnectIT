import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/utility/axiosConfig";
import {
  Profile,
  ProfileAvatar,
  ProfileCardLeft,
  ProfileCardRight,
  ProfileTitle,
  ProfileField,
  ProfileAction,
  Tabs,
  TabPanel,
  ProfileJobCard,
} from "@/components/ProfileCard";
import PdfViewerModal from "@/components/PortfolioModal";
import ConfirmModal from "@/components/CustomDialogs/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Role, useAuth } from "@/contexts/AuthContext";
import {
  User,
  UserSchema,
  ValidatedUser,
  Company,
  CompanySchema,
  ValidatedCompany,
  AccountSchema,
  ValidatedAccount,
} from "@/type/account";
import { getCompanyStatus } from "@/utility/getCompanyStatus";
import { ApplicationToaster } from "@/components/CustomToaster";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/loading-circle";
import { JobListing, JobListingSchema } from "@/type/jobListing";

type AccountData = ValidatedUser | ValidatedCompany | ValidatedAccount;

const ProfilePage = () => {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<AccountData | null>(null);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [disableLoading, setDisableLoading] = useState(false);

  const { accountId, logout } = useAuth();

  //  Convert viewId to number for comparison
  const viewIdNumber = viewId ? Number(viewId) : null;

  // Fix the comparison - both are now numbers
  const isOwner = viewIdNumber === accountId;

  const [activeTab, setActiveTab] = useState("Job Listings");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/profile/${viewId}`);
        const data = response.data;

        let parsed;
        switch (data.role) {
          case Role.User:
            parsed = UserSchema.parse(data);
            break;
          case Role.Company:
            parsed = CompanySchema.parse(data);
            break;
          case Role.Admin:
            parsed = AccountSchema.parse(data);
            break;
          default:
            throw new Error("Unsupported account role");
        }

        setUser(parsed);

        if (parsed.role === Role.Company) {
          const jobRes = await axios.get(
            `/api/companyJobListings/${parsed.companyId}`
          );
          const jobs = Array.isArray(jobRes.data)
            ? jobRes.data
                .map((item) => {
                  try {
                    return JobListingSchema.parse(item);
                  } catch (err) {
                    console.error(
                      "Invalid job listing for company:",
                      err,
                      item
                    );
                    return null;
                  }
                })
                .filter(Boolean)
            : [];
          setJobListings(jobs as JobListing[]);
        }
      } catch (error) {
        console.error("Failed to load account:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [viewId]);

  const handleConfirmDisable = async (password: string) => {
    setDisableLoading(true);
    try {
      await axios.post(`/api/profile/disable/${accountId}`, {
        password,
      });
      setShowDeleteModal(false);
      setDisableLoading(false);
      logout();
      navigate("/");
    } catch (err) {
      toast.error("Failed to disable account. Please try again");
      console.error("Failed to disable account:", err);
    }
  };

  if (!user && !loading) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">User not found.</div>
      </div>
    );
  }

  if (!loading && user.isDisabled) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">
          This user&rsquo;s account is disabled.
        </div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto px-4 py-8">
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <LoadingSpinner message="Loading profile..." />
        </div>
      ) : (
        <>
          <Profile>
            <ProfileCardLeft>
              <ProfileAvatar
                src={user.profilePicUrl}
                fallbackText={user.name}
              />
              <ProfileTitle>{user.name}</ProfileTitle>
              <ProfileField
                label="Name: "
                value={user.name || user.name.toLowerCase().replace(" ", "_")}
              />
              <ProfileField label="Email: " value={user.email} />
              {user.role === Role.Company && (
                <>
                  <ProfileField
                    label="Address: "
                    value={(user as Company).location || "-"}
                  />
                  <ProfileField
                    label="Verified: "
                    value={getCompanyStatus((user as Company).verified)}
                  />
                </>
              )}
              {isOwner && user.role !== Role.Admin && (
                <ProfileAction className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <Link to="/profile/edit">
                    <Button className="w-full sm:w-auto">Edit Profile</Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </Button>
                </ProfileAction>
              )}
            </ProfileCardLeft>

            <ProfileCardRight>
              <ProfileTitle>About</ProfileTitle>
              {user.role === Role.Company ? (
                <ProfileField
                  label="About the Company: "
                  value={
                    (user as Company).description ||
                    "No company description available."
                  }
                />
              ) : (
                <>
                  <ProfileField
                    label="Bio: "
                    value={(user as User).bio || "No bio available."}
                  />
                  {(user as User).portfolioUrl && (
                    <div className="pt-2">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => {
                          setPdfUrl(
                            `/api/profile/portfolio/view?uri=${encodeURIComponent(
                              (user as User).portfolioUrl
                            )}`
                          );
                          setPdfModalOpen(true);
                        }}
                      >
                        View Portfolio
                      </Button>
                    </div>
                  )}
                </>
              )}

              <div className="pt-6">
                <Tabs
                  tabs={[
                    ...(user.role === Role.Company ? ["Job Listings"] : []),
                  ]}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />

                <div className="pt-4">
                  {activeTab === "Job Listings" &&
                    user.role === Role.Company && (
                      <TabPanel isActive={true}>
                        {jobListings && jobListings.length > 0 ? (
                          <div className="space-y-4">
                            {jobListings.map((job) => (
                              <ProfileJobCard key={job.jobId} job={job} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No jobs posted yet.
                          </div>
                        )}
                      </TabPanel>
                    )}
                </div>
                <ApplicationToaster />
              </div>
            </ProfileCardRight>

            {pdfUrl && (
              <PdfViewerModal
                isOpen={pdfModalOpen}
                onClose={() => setPdfModalOpen(false)}
                pdfUrl={pdfUrl}
                title={`${user.name}'s Portfolio`}
              />
            )}

            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={(password) => {
                handleConfirmDisable(password);
              }}
              title="Delete your account?"
              description="This action cannot be undone and will permanently remove your account."
              confirmText="Delete"
              cancelText="Cancel"
              loading={disableLoading}
            />
          </Profile>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
