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
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type Props = {
  secret: string;
  onSuccess: () => void;
};

export function Verify2FAForm({ secret, onSuccess }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!secret) {
      toast.error("Secret is not available");
      return;
    }

    try {
      const res = await axios.post("/api/2fa-verify", { code, secret });
      if (res.data.verified) {
        toast.success("2FA Verified");
        onSuccess();
      } else {
        setStatus("Invalid code");
      }
    } catch {
      setStatus("Verification failed");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Verify 2FA</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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
        {status && <p className="text-red-500 text-sm">{status}</p>}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={code.length !== 6}
        >
          Verify 2FA
        </Button>
      </CardFooter>
    </Card>
  );
}
