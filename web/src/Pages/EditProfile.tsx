import React from "react";
import { Link } from "react-router-dom";
import {
  EditProfile,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
} from "@/components/EditProfileCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/components/FakeData/mockUser";

const EditProfilePage = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
    const sessionUser = 1;
    const user = mockUsers.find((u) => u.userId === Number(sessionUser));

  return (
    <Card className="max-w-3xl mx-auto p-6 mt-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <EditProfile onSubmit={handleSubmit}>
        <EditProfileGroup>
            <EditProfileField label="Full Name">
                <EditProfileInput name="name" placeholder="Jane Doe" value={user?.name} />
            </EditProfileField>

            <EditProfileField label="Email">
                <EditProfileInput type="email" name="email" placeholder="You@example.com" value={user?.email} />
            </EditProfileField>

            {user?.role === "User" && (
                <>
                <EditProfileField label="Bio">
                    <EditProfileTextarea name="bio" placeholder="About yourself..." value={user?.bio} />
                </EditProfileField>

                <EditProfileField label="Portfolio">
                    <EditProfileInput
                    type="url"
                    name="portfolio"
                    placeholder="Your portfolio URL"
                    value={user?.portfolioUrl}
                    />
                </EditProfileField>
                </>
            )}

            {user?.role === "Company" && (
                <>
                <EditProfileField label="Address">
                    <EditProfileInput name="address" placeholder="Company address" value={user?.address} />
                </EditProfileField>

                <EditProfileField label="Description">
                    <EditProfileTextarea name="description" placeholder="What does your company do?" value={user?.description} />
                </EditProfileField>
                </>
            )}
            </EditProfileGroup>

        <EditProfileActions>
            <Link to={`/profile/${user?.userId}`}>
                <Button variant="outline" type="button">Cancel</Button>
            </Link>
          <Button type="submit">Save Changes</Button>
        </EditProfileActions>
      </EditProfile>
    </Card>
  );
};

export default EditProfilePage;