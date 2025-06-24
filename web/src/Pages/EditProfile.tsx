import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  EditProfileCard,
  EditableAvatar,
  EditProfile,
  EditProfileGroup,
  EditProfileField,
  EditProfileInput,
  EditProfileTextarea,
  EditProfileActions,
} from "@/components/EditProfileCard";
import PdfUpload from "@/components/ui/file-input";
import { Button } from "@/components/ui/button";
import { Role, useAuth } from "@/contexts/AuthContext";
import {
  User,
  UserSchema,
  ValidatedUser,
  Company,
  CompanySchema,
  ValidatedCompany,
} from "@/type/account";
import { ApplicationToaster } from "@/components/CustomToaster";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/loading-circle";

type AccountData = ValidatedUser | ValidatedCompany;

const EditProfilePage = () => {
  const { accountId } = useAuth();
  const [user, setUser] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirm] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDesc] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true);
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
        } else if (parsed.role === Role.Company) {
          const c = parsed as Company;
          setLocation(c.location || "");
          setDesc(c.description || "");
        }
      } catch (error) {
        console.error("Failed to load account:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    // TO ADD OLD PW AND NEW PW IN (Check if any of the fields are not empty)
    // If not, send all
    formData.append("accountId", accountId.toString());
    formData.append("name", name);
    formData.append("role", user.role);

    if (bio.trim()) formData.append("bio", bio);
    if (location.trim()) formData.append("location", location);
    if (description.trim()) formData.append("description", description);

    if (password && newPassword && confirmNew) {
      formData.append("password", password);
      formData.append("newPassword", newPassword);
      formData.append("confirmNew", confirmNew);
    }
    formData.append("portfolioFile", portfolioFile);
    formData.append("profilePic", profilePic);

    try {
      const response = await axios.post("/api/profile/save", formData);
      navigate(`/profile/${accountId}`);
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Failed to save profile, please try again.";

      toast.error(message);
      console.log("Failed to save profile", err);
    }
  };

  if (!user && !loading) {
    return (
      <div className="w-4/5 mx-auto px-4 py-8">
        <div className="mt-6 text-center text-gray-400">User not found.</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-start px-4 py-10 overflow-auto">
      {loading ? (
        <LoadingSpinner message="Loading profile..." />
      ) : (
        <>
          <EditProfileCard>
            <EditProfile onSubmit={handleSubmit} encType="multipart/form-data">
              <EditableAvatar
                imageUrl={user.profilePicUrl}
                fallbackText={user.name}
                onFileSelect={(file) => setProfilePic(file)}
              />
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

              <EditProfileGroup>
                <EditProfileField label="Full Name">
                  <EditProfileInput
                    name="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </EditProfileField>

                <EditProfileField label="Old Password">
                  <EditProfileInput
                    type="password"
                    name="oldPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </EditProfileField>
                <EditProfileField label="New Password">
                  <EditProfileInput
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </EditProfileField>
                <EditProfileField label="Confirm New Password">
                  <EditProfileInput
                    type="password"
                    name="confirmPassword"
                    value={confirmNew}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </EditProfileField>

                {user.role === Role.User && (
                  <>
                    <EditProfileField label="Bio">
                      <EditProfileTextarea
                        name="bio"
                        placeholder="About yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </EditProfileField>

                    <PdfUpload
                      name="portfolioPdf"
                      label="Upload your portfolio"
                      accept=".pdf"
                      onChange={(file) => setPortfolioFile(file)}
                    />
                  </>
                )}

                {user.role === Role.Company && (
                  <>
                    <EditProfileField label="Address">
                      <EditProfileInput
                        name="address"
                        placeholder="Company address"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </EditProfileField>

                    <EditProfileField label="Description">
                      <EditProfileTextarea
                        name="description"
                        placeholder="What does your company do?"
                        value={description}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                    </EditProfileField>
                  </>
                )}
              </EditProfileGroup>

              <EditProfileActions>
                <Link to={`/profile/${user.accountId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Save Changes</Button>
              </EditProfileActions>
            </EditProfile>
          </EditProfileCard>
        </>
      )}
      <ApplicationToaster />{" "}
    </div>
  );
};

export default EditProfilePage;
