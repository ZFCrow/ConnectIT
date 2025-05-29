import { useParams, Link } from "react-router-dom";
import React, { useState } from "react";
import { mockUsers } from "@/components/FakeData/mockUser";
import { mockPosts } from "@/components/FakeData/mockPosts";
import { sampleJobs } from "@/components/FakeData/sampleJobs";
import {
  Profile,
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
import { Button } from "@/components/ui/button"


const ProfilePage = () => {
    const sessionUser = 1;
    const { userId } = useParams<{ userId: string }>();
    const user = mockUsers.find((u) => u.userId === Number(userId));
      const isOwner = user?.userId === sessionUser

    const [activeTab, setActiveTab] = useState("Posts");

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
          <ProfileTitle>{user.name}</ProfileTitle>
          <ProfileField label="Name: " value={user.name || user.name.toLowerCase().replace(" ", "_")} />
          <ProfileField label="Email: " value={user.email} />
          {user.role === "Company" && (
            <>
              <ProfileField label="Address: " value={user.address || "-"} />
              <ProfileField label="Verified: " value={user.verified ? "Yes" : "No"} />
            </>
          )}
        </ProfileCardLeft>

        <ProfileCardRight>
          <ProfileTitle>About</ProfileTitle>
          {user.role === "Company" ? (
              <ProfileField label="About the Company: " value={user.description || "No company description available."} />
            ) : (
              <>
                <ProfileField label="Bio: " value={user.bio || "No bio available."} />
                <ProfileField
                  label="Portfolio: "
                  value={
                    user.portfolioUrl ? (
                      <a
                        className="text-blue-500 underline"
                        href={user.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {user.portfolioUrl}
                      </a>
                    ) : (
                      "No portfolio link."
                    )
                  }
                />
              </>
            )}

          {isOwner && (
            <ProfileAction>
              <Link to="/profile/edit">
                <Button>Edit Profile</Button>
              </Link>
            </ProfileAction>
          )}

          <div className="pt-6">
            <Tabs
              tabs={[
                "Posts",
                ...(user.role === "Company" ? ["Job Listings"] : []),
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
                      {mockPosts.filter((post) => post.userId == userId).map((post) => (
                        <ProfilePostCard key={post.id} {...post} />
                      ))}
                    </div>
                  ) : (
                      <div className="text-sm text-muted-foreground">No posts yet.</div>
                  )}
                </TabPanel>
              )}

              {activeTab === "Job Listings" && user.role === "Company" && (
                <TabPanel isActive={true}>
                  {sampleJobs && sampleJobs.length > 0 ? (
                    <div className="space-y-4">
                      {sampleJobs.filter((job) => job.companyId == userId)
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
                  <div className="text-sm text-muted-foreground">Your applied jobs go here.</div>
                </TabPanel>
              )}
            </div>
          </div>
        </ProfileCardRight>
      </Profile>
    </div>
  );
}

export default ProfilePage;