import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const PendingApprovalPage = () => {
  const { name } = useAuth();

  return (
    <div className="w-4/5 mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-12">
      <Card className="w-full max-w-lg mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Account Verification Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg font-medium">{name ? `Hi ${name},` : "Hi,"}</p>
          <p>
            Thank you for registering your company account.
            <br />
            Your account is currently being reviewed by our administrators.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
