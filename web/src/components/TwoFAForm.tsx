import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ApplicationToaster } from "./CustomToaster";

export function TwoFAForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!email) return;

    axios
      .post("/api/2fa-generate", { email })
      .then((res) => {
        const { qr_code, secret, is2FAEnabled } = res.data;
        setSecret(secret);

        if (is2FAEnabled) {
          setStep(2);
        } else {
          setQrCode(qr_code);
          setStep(1);
        }
      })
      .catch(() => toast.error("Failed to load QR code"));
  }, [email]);

  const handleVerify = async () => {
    if (!secret) {
      toast.error("Secret is not available");
      return;
    }

    try {
      const res = await axios.post("/api/2fa-verify", { code, secret });
      if (res.data.verified) {
        toast.success("2FA Verified");
        navigate("/");
      } else {
        setStatus("Invalid code");
      }
    } catch {
      setStatus("Verification failed");
    }
  };

  if (!email) {
    return (
      <p className="text-center text-red-500">
        Missing email. Please restart login.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set Up 2FA</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && qrCode && (
            <>
              <p className="text-sm text-muted-foreground">
                Scan the QR code below with Google Authenticator, then click
                Next.
              </p>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                className="mx-auto"
              />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from Google Authenticator.
              </p>
              <div className="space-y-1">
                <Label htmlFor="token">Code</Label>
                <Input
                  id="token"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="dark:bg-gray-800 dark:border-gray-600"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              {status && <p className="text-red-500 text-sm">{status}</p>}
            </>
          )}
        </CardContent>

        <CardFooter>
          {step === 1 && (
            <Button className="w-full" onClick={() => setStep(2)}>
              Next
            </Button>
          )}

          {step === 2 && (
            <>
              <Button
                className="w-1/2"
                variant="outline"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button className="w-1/2" onClick={handleVerify}>
                Verify 2FA
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <ApplicationToaster />
    </div>
  );
}
