import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioButton } from "@/components/ui/radio-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Role } from "@/contexts/AuthContext";

// captcha
import { HCaptchaForm } from "@/components/HcaptchaForm"; // Import HCaptchaForm
import { useCaptchaVerification } from "@/components/CaptchaVerification";
import PdfUpload from "@/components/ui/file-input";
import { ApplicationToaster } from "./CustomToaster";
import toast from "react-hot-toast";

export function RegisterForm() {
  const [accountType, setAccountType] = useState<Role>(Role.User);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const [companyDoc, setCompanyDoc] = useState<File | null>(null);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Captcha
  const { captchaVerificationStatus, verifyCaptchaToken } = useCaptchaVerification();
  const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    if (password != confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 64) {
      setError("Password must be between 8 and 64 characters.");
      return;
    }

    if (captchaVerificationStatus !== "Verified") {
      setError("Please complete the CAPTCHA verification.");
      console.warn(
        "CAPTCHA has not been successfully verified. Please complete the CAPTCHA."
      );
      return;
    }

    try {
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", accountType);

      if (accountType == Role.Company && companyDoc) {
        formData.append("companyDoc", companyDoc);
      }

      const response = await axios.post("/api/register", formData);

      navigate("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Error during registration, please try again.";

      if (typeof message === "object") {
        const combined = Object.values(message).join(" ");
        toast.error(combined);
      } else {
        toast.error(message);
      }
      // toast.error("Error during registration, please try again.");
      console.log("Registration failed", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                className="dark:bg-gray-800 dark:border-gray-600"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="You@example.com"
                className="dark:bg-gray-800 dark:border-gray-600"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="dark:bg-gray-800 dark:border-gray-600"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                minLength={8}
                maxLength={64}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                className="dark:bg-gray-800 dark:border-gray-600"
                onChange={(e) => setConfirm(e.target.value)}
                value={confirmPassword}
                minLength={8}
                maxLength={64}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="block">I am signing up as a...</Label>
              <div className="flex gap-4">
                <RadioButton
                  label="IT Enthusiast"
                  name="accountType"
                  value={Role.User}
                  checked={accountType === Role.User}
                  onChange={() => setAccountType(Role.User)}
                />
                <RadioButton
                  label="Company"
                  name="accountType"
                  value={Role.Company}
                  checked={accountType === Role.Company}
                  onChange={() => setAccountType(Role.Company)}
                />
              </div>
            </div>

            {accountType === Role.Company && (
              <div className="space-y-2">
                <PdfUpload
                  name="companyDoc"
                  label="Upload verification document"
                  accept=".pdf"
                  onChange={(file) => setCompanyDoc(file)}
                />
              </div>
            )}

            {/*Captcha*/}
            <div className="mt-4">
              <HCaptchaForm
                sitekey={HCAPTCHA_SITEKEY}
                onTokenChange={verifyCaptchaToken} // This connects the HCaptcha completion to your verification logic
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-3">
            <Link
              to="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Already have an account? Click here to log in
            </Link>
            <Button className="w-full">Sign Up</Button>
          </CardFooter>
        </form>
      </Card>
      <ApplicationToaster />{" "}
    </div>
  );
}
