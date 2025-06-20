import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios"
import { mockPosts } from "@/components/FakeData/mockPosts";
import { mockAppliedJobs } from "@/components/FakeData/MockAppliedJobs";
import { sampleJobs } from "@/components/FakeData/sampleJobs";
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
  ProfilePostCard
} from "@/components/ProfileCard"
import  PdfViewerModal  from "@/components/PortfolioModal"
import ConfirmModal from "@/components/CustomDialogs/ConfirmDialog";
import { Button } from "@/components/ui/button"
import { Role, useAuth } from "@/contexts/AuthContext";
import { User, UserSchema, ValidatedUser, 
  Company, CompanySchema, ValidatedCompany,
AccountSchema, ValidatedAccount } from "@/type/account";

type AccountData = ValidatedUser | ValidatedCompany | ValidatedAccount;

const ProfilePage = () => {
    const { viewId } = useParams<{ viewId: string }>();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<AccountData | null>(null);

    const { accountId, logout } = useAuth();

    //  Convert viewId to number for comparison
    const viewIdNumber = viewId ? Number(viewId) : null;
  
    // Fix the comparison - both are now numbers
    const isOwner = viewIdNumber === accountId;

    const [activeTab, setActiveTab] = useState("Posts");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
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
        console.log("Validated account:", parsed);
      } catch (error) {
        console.error("Failed to load account:", error);
      }
    };

    fetchAccount();
  }, []);

  const handleConfirmDisable = async (password: string) => {
    try {
      const response = await axios.post(`/api/profile/disable/${accountId}`, {
        password,
      });
      console.log("Account disabled:", response.data);
      // Redirect to home page and logout?
      logout();
      navigate('/');

    } catch (err) {
      console.error("Failed to disable account:", err);
    }
  };

  if (!user) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">User not found.</div>
      </div>
    );
  }

  // if (user.isDisabled){
  //   return (
  //     <div className="w-4/5 mx-auto px-4 py-8">
  //       <div className="mt-6 text-center text-gray-400">This user's account is disabled.</div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-4/5 mx-auto px-4 py-8">
      <Profile>
        <ProfileCardLeft>
          <ProfileAvatar src={user.profilePicUrl} fallbackText={user.name} />
          <ProfileTitle>{user.name}</ProfileTitle>
          <ProfileField label="Name: " value={user.name || user.name.toLowerCase().replace(" ", "_")} />
          <ProfileField label="Email: " value={user.email} />
          {user.role === Role.Company && (
            <>
              <ProfileField label="Address: " value={(user as Company).location || "-"} />
              <ProfileField label="Verified: " value={(user as Company).verified ? "Yes" : "No"} />
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
              <ProfileField label="About the Company: " value={(user as Company).description || "No company description available."} />
            ) : (
              <>
                <ProfileField label="Bio: " value={(user as User).bio || "No bio available."} />
                {(user as User).portfolioUrl && (
                <div className="pt-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setPdfUrl((user as User).portfolioUrl);
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
                "Posts",
                ...(user.role === Role.Company ? ["Job Listings"] : []),
                ...(isOwner ? ["My Applied Jobs"] : []),
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="pt-4">
              {activeTab === "Posts" && (
                <TabPanel isActive={true}>
                  {mockPosts ? (
                    <div className="space-y-4">
                      {mockPosts.filter((post) => post.accountId == user.accountId).map((post) => (
                        <ProfilePostCard key={post.id} {...post} />
                      ))}
                    </div>
                  ) : (
                      <div className="text-sm text-muted-foreground">No posts yet.</div>
                  )}
                </TabPanel>
              )}

              {activeTab === "Job Listings" && user.role === Role.Company && (
                <TabPanel isActive={true}>
                  {sampleJobs && sampleJobs.length > 0 ? (
                    <div className="space-y-4">
                      {sampleJobs.filter((job) => job.companyId == viewIdNumber)
                      .map((job) => (
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

              {activeTab === "My Applied Jobs" && isOwner && (
                <TabPanel isActive={true}>
                  {/* {mockAppliedJobs && mockAppliedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {mockAppliedJobs.filter((job) => job.userId == accountId)
                      .map((job) => (
                        <ProfileJobCard key={job.jobId} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No jobs applied at the moment.
                    </div>
                  )} */}
                  <div className="text-sm text-muted-foreground">No jobs applied at the moment.</div>
                </TabPanel>
              )}
            </div>
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
          handleConfirmDisable(password)
          setShowDeleteModal(false);
          console.log("Account deleted"); // Replace with actual deletion logic
        }}
        title="Delete your account?"
        description="This action cannot be undone and will permanently remove your account."
        confirmText="Delete"
        cancelText="Cancel"
      />
      </Profile>
    </div>
  );
}

export default ProfilePage;