import { CheckCircle, XCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";

export const ApplicationToaster = () => (
  <Toaster
    position="bottom-center"
    reverseOrder={false}
    gutter={12}
    toastOptions={{
      duration: 4000,
      style: {
        background: "#18181b", // zinc-900
        color: "#f4f4f5", // zinc-100
        border: "1px solid #3f3f46", // zinc-700
        padding: "12px 16px",
        borderRadius: "8px",
        fontSize: "1 rem",
        transition: "all 0.3s ease",
        maxWidth: "500px",
        minWidth: "300px",
      },
      success: {
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,

        iconTheme: {
          primary: "#22c55e",
          secondary: "#ecfdf5",
        },
      },
      error: {
        icon: <XCircle className="w-6 h-6 text-red-500" />,

        iconTheme: {
          primary: "#ef4444",
          secondary: "#fee2e2",
        },
      },
    }}
  />
);
