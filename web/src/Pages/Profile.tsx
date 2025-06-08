import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { mockUsers } from "@/components/FakeData/mockUser";
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


const ProfilePage = () => {
    const { viewId } = useParams<{ viewId: string }>();
    const user = mockUsers.find((u) => u.accountId === Number(viewId));

    const { accountId } = useAuth();
    //const isOwner = viewId == accountId

    //  Convert viewId to number for comparison
    const viewIdNumber = viewId ? Number(viewId) : null;
  
    // Fix the comparison - both are now numbers
    const isOwner = viewIdNumber === accountId;

    const [activeTab, setActiveTab] = useState("Posts");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">User not found.</div>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto px-4 py-8">
      <Profile>
        <ProfileCardLeft>
          <ProfileAvatar src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} fallbackText={user.name} />
          <ProfileTitle>{user.name}</ProfileTitle>
          <ProfileField label="Name: " value={user.name || user.name.toLowerCase().replace(" ", "_")} />
          <ProfileField label="Email: " value={user.email} />
          {user.role === Role.Company && (
            <>
              <ProfileField label="Address: " value={user.address || "-"} />
              <ProfileField label="Verified: " value={user.verified ? "Yes" : "No"} />
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
              <ProfileField label="About the Company: " value={user.description || "No company description available."} />
            ) : (
              <>
                <ProfileField label="Bio: " value={user.bio || "No bio available."} />
                {user.portfolioUrl && (
                <div className="pt-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setPdfUrl(user.portfolioUrl);
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
                      {mockPosts.filter((post) => post.accountId == viewIdNumber).map((post) => (
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
        onConfirm={() => {
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