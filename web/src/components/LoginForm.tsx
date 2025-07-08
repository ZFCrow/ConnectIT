import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
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
import axios from "@/utility/axiosConfig";
import { ApplicationToaster } from "./CustomToaster";
import toast from "react-hot-toast";

import { Generate2FAForm } from "./Generate2FAForm";
import { Verify2FAForm } from "./Verify2FAForm";
import { HCaptchaForm } from "./HcaptchaForm"; // Import your HCaptchaForm

type AccountData = ValidatedUser | ValidatedCompany | ValidatedAccount;

function getCookie(name: string): string | null {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"login" | "generate" | "verify">("login");
  const [user, setUser] = useState<AccountData | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const HCAPTCHA_SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY;

  const callCreateToken = async (account: AccountData) => {
    try {
      await axios.post("/api/create_token", account, { withCredentials: true });
      login(account.accountId, account.role, account.name, {
        userId: (account as User).userId,
        companyId: (account as Company).companyId,
        profilePicUrl: account.profilePicUrl,
        verified:
          account.role === Role.Company
            ? (account as Company).verified === 1 // 1 ⇒ true
            : true,
      });

      setCaptchaToken(null);
      setShowCaptcha(false);
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Token creation failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showCaptcha && !captchaToken) {
      toast.error("Please complete the CAPTCHA before logging in.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/login", {
        email,
        password,
        captchaToken: captchaToken,
      });
      const data = response.data;

      setCaptchaToken(null);
      setShowCaptcha(false);

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

      if (parsed.twoFaEnabled) {
        setStep("verify");
      } else {
        setStep("generate");
      }
    } catch (err: any) {
      console.error("Login failed", err);
      const msg = err.response?.data?.error || err.response?.data?.message;
      toast.error(msg || "Login error");


      if (err.response?.data?.showCaptcha) {
        setShowCaptcha(true);
        setCaptchaToken(null);
      } else {
        setShowCaptcha(false);
        setCaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async () => {
    if (user) {
      await callCreateToken(user);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {step === "login" && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Lock In</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={64}
                  required
                />
              </div>

              {showCaptcha && HCAPTCHA_SITEKEY && (
                <div className="space-y-2">
                  <Label htmlFor="captcha">
                    Please verify you&rsquo;re not a robot
                  </Label>
                  <HCaptchaForm
                    sitekey={HCAPTCHA_SITEKEY}
                    onTokenChange={setCaptchaToken}
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                Don&rsquo;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </CardContent>
            <CardFooter>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <svg
                    className="animate-spin h-8 w-8 text-red-500 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-gray-400 text-lg">Loading…</span>
                </div>
              ) : (
                  <Button className="w-full" disabled={loading}>Log In</Button>
              )}
            </CardFooter>
          </form>
        </Card>
      )}
      {step === "generate" && (
        <Generate2FAForm
          email={email}
          accountId={user.accountId}
          onSuccess={handle2FASuccess}
          onStartLoading={() => setLoading(true)}
          loading={loading}
        />
      )}
      {step === "verify" && (
        <Verify2FAForm
          accountId={user.accountId}
          secret={user.twoFaSecret}
          onSuccess={handle2FASuccess}
          onStartLoading={() => setLoading(true)}
          loading={loading}
        />
      )}
      <ApplicationToaster />{" "}
    </div>
  );
}
