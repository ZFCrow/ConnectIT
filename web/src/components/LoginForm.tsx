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
import { useState } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { User, UserSchema, ValidatedUser, 
  Company, CompanySchema, ValidatedCompany,
AccountSchema, ValidatedAccount } from "@/type/account";
import axios from "axios";
import { ApplicationToaster } from "./CustomToaster";
import toast from "react-hot-toast";

import { Generate2FAForm } from "./Generate2FAForm";
import { Verify2FAForm } from "./Verify2FAForm";

type AccountData = ValidatedUser | ValidatedCompany | ValidatedAccount;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"login" | "generate" | "verify">("login");
  const [user, setUser] = useState<AccountData | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/login", {
        email,
        password,
      });
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

      setUser(parsed)
      console.log(parsed.twoFaEnabled);
      setStep(parsed.twoFaEnabled ? "verify" : "generate");

    } catch (err: any) {
      toast.error("Error logging in, please try again.");
      console.log("Login failed", err);
    }
  };

  const handle2FASuccess = () => {
    login(user.accountId, user.role, user.name, {
      userId: (user as User).userId,
      companyId: (user as Company).companyId,
      profilePicUrl: user.profilePicUrl,
    });
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {step === "login" && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Log In</CardTitle>
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
                  required
                />
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign up here
                </Link>
              </p>
            </CardContent>

            <CardFooter>
              <Button className="w-full">Log In</Button>
            </CardFooter>
          </form>
        </Card>
      )}
      {step === "generate" && (
        <Generate2FAForm
          email={email}
          accountId={user.accountId}
          onSuccess={handle2FASuccess}
        />
      )}
      {step === "verify" && (
        <Verify2FAForm
          secret={user.twoFaSecret}
          onSuccess={handle2FASuccess}
        />
      )}
      <ApplicationToaster />{" "}
    </div>
  );
}
