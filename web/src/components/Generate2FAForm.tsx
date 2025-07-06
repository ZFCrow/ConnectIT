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
import { useState, useEffect } from "react";
import axios from "@/utility/axiosConfig";
import toast from "react-hot-toast";

type Props = {
  email: string;
  accountId: number;
  onSuccess: () => Promise<void>;
  onStartLoading?: () => void;
  loading: boolean;
};

export function Generate2FAForm({ email, accountId, onSuccess,
  onStartLoading, loading
 }: Props) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    axios
      .post("/api/2fa-generate", { email })
      .then((res) => {
        const { qr_code, secret } = res.data;
        setSecret(secret);
        setQrCode(qr_code);
      })
      .catch(() => toast.error("Failed to load QR code"));
  }, [email]);

  const handleVerify = async () => {
    if (!secret) {
      toast.error("Secret is not available");
      return;
    }
    onStartLoading?.();
    try {
      const res = await axios.post("/api/2fa-verify", { accountId, code, secret });
      if (res.data.verified) {
        toast.success("2FA Verified");

        try {
          const res = await axios.post("/api/save2fa", {
            accountId: accountId,
            enabled: true,
            secret: secret,
          });

          onSuccess();
        } catch (error) {
          toast.error("Failed to save 2FA");
        }
      } else {
        toast.error("Invalid 2FA code");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error;
      toast.error(msg || "Verification Failed");
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Set Up 2FA</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Scan the QR code below with Google Authenticator, then click Next.
        </p>
        <img
          src={`data:image/png;base64,${qrCode}`}
          alt="QR Code"
          className="mx-auto"
        />
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
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />
        </div>
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
              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={code.length !== 6 || loading}
              >
                Verify 2FA
              </Button>
          )}
        </CardFooter>
    </Card>
  );
}
