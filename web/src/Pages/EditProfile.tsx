import React from "react";
import { Link } from "react-router-dom";
import {
  EditProfileCard,
  EditableAvatar,
  EditProfile,
  PortfolioUpload,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
} from "@/components/EditProfileCard";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/components/FakeData/mockUser";
import { Role, useAuth } from "@/contexts/AuthContext";

const EditProfilePage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const { accountId } = useAuth();
  const user = mockUsers.find((u) => u.userId === Number(accountId));

  if (!user) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">User not found.</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-start px-4 py-10 overflow-auto">
      <EditProfileCard>
        <EditableAvatar
          imageUrl={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
          fallbackText={user.name}
        />
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

        <EditProfile onSubmit={handleSubmit}>
          <EditProfileGroup>
              <EditProfileField label="Full Name">
                  <EditProfileInput name="name" placeholder="Jane Doe" value={user.name} />
              </EditProfileField>

              <EditProfileField label="Old Password">
                  <EditProfileInput type="password" name="oldPassword" />
              </EditProfileField>
              <EditProfileField label="New Password">
                  <EditProfileInput type="password" name="newPassword" />
              </EditProfileField>
              <EditProfileField label="Confirm New Password">
                  <EditProfileInput type="password" name="confirmPassword" />
              </EditProfileField>

              {user.role === Role.User && (
                  <>
                  <EditProfileField label="Bio">
                      <EditProfileTextarea name="bio" placeholder="About yourself..." value={user.bio} />
                  </EditProfileField>

                  <PortfolioUpload name="portfolioPdf" label="Upload your portfolio" accept=".pdf" />
                  </>
              )}

              {user.role === Role.Company && (
                  <>
                  <EditProfileField label="Address">
                      <EditProfileInput name="address" placeholder="Company address" value={user.address} />
                  </EditProfileField>

                  <EditProfileField label="Description">
                      <EditProfileTextarea name="description" placeholder="What does your company do?" value={user.description} />
                  </EditProfileField>
                  </>
              )}
              </EditProfileGroup>

          <EditProfileActions>
              <Link to={`/profile/${user.accountId}`}>
                  <Button variant="outline" type="button">Cancel</Button>
              </Link>
            <Button type="submit">Save Changes</Button>
          </EditProfileActions>
        </EditProfile>
      </EditProfileCard>
    </div>
  );
};

export default EditProfilePage;