import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
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
import { Role, useAuth } from "@/contexts/AuthContext";
import { User, UserSchema, ValidatedUser, Company, CompanySchema, ValidatedCompany } from "@/type/account";

const api = axios.create({
  baseURL: "/api",
});

type AccountData = ValidatedUser | ValidatedCompany;

const EditProfilePage = () => {
  const { accountId } = useAuth();
  const [user, setUser] = useState<AccountData | null>(null);

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNew, setConfirm] = useState("")
  const [bio, setBio] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [profilePicUrl, setProfilePic] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDesc] = useState("")

  useEffect(() => {
      const fetchAccount = async () => {
        try {
          const response = await axios.get(`/api/profile/${accountId}`);
          const data = response.data;
  
          let parsed;
          switch (data.role) {
            case Role.User:
              parsed = UserSchema.parse(data);
              break;
            case Role.Company:
              parsed = CompanySchema.parse(data);
              break;
            default:
              throw new Error("Unsupported account role");
          }
  
          setUser(parsed);

          setName(parsed.name || "");
          setProfilePic(parsed.profilePicUrl || "");

          if (parsed.role === Role.User) {
            const u = parsed as User;
            setBio(u.bio || "");
            setPortfolioUrl(u.portfolioUrl || "");
          } else if (parsed.role === Role.Company) {
            const c = parsed as Company;
            setLocation(c.location || "");
            setDesc(c.description || "");
          }

          console.log("Validated account:", parsed);
        } catch (error) {
          console.error("Failed to load account:", error);
        }
      };
  
      fetchAccount();
    }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TO ADD OLD PW AND NEW PW IN (Check if any of the fields are not empty)
    // If not, send all
    const updatedData = {
      accountId,
      name, 
      bio: bio.trim() || null,
      portfolioUrl: portfolioUrl.trim() || null,
      location: location.trim() || null,
      description: description.trim() || null,
      profilePicUrl: profilePicUrl.trim() || null,
      role: user.role,
    }

    try{
      const response = await axios.post("/api/profile/save", updatedData)

      console.log("Saved", response.data)
    } catch (err: any){
      console.log("Failed to save profile", err)
    }
  };
  

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
                  <EditProfileInput name="name" placeholder="John Doe" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </EditProfileField>

              <EditProfileField label="Old Password">
                  <EditProfileInput type="password" name="oldPassword" value={password}
                  onChange={(e) => setPassword(e.target.value)} />
              </EditProfileField>
              <EditProfileField label="New Password">
                  <EditProfileInput type="password" name="newPassword" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
              </EditProfileField>
              <EditProfileField label="Confirm New Password">
                  <EditProfileInput type="password" name="confirmPassword" value={confirmNew}
                  onChange={(e) => setConfirm(e.target.value)} />
              </EditProfileField>

              {user.role === Role.User && (
                  <>
                  <EditProfileField label="Bio">
                      <EditProfileTextarea name="bio" placeholder="About yourself..." value={bio}
                      onChange={(e) => setBio(e.target.value)} />
                  </EditProfileField>

                  <PortfolioUpload name="portfolioPdf" label="Upload your portfolio" accept=".pdf" />
                  </>
              )}

              {user.role === Role.Company && (
                  <>
                  <EditProfileField label="Address">
                      <EditProfileInput name="address" placeholder="Company address" value={location}
                      onChange={(e) => setLocation(e.target.value)} />
                  </EditProfileField>

                  <EditProfileField label="Description">
                      <EditProfileTextarea name="description" placeholder="What does your company do?" value={description}
                      onChange={(e) => setDesc(e.target.value)} />
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