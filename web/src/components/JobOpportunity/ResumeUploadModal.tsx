import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { CheckCircle } from "lucide-react";
export const ApplicationToaster = () => (
  <Toaster
    position="bottom-center"
    reverseOrder={false}
    gutter={12}
    toastOptions={{
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,

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
        iconTheme: {
          primary: "#22c55e",
          secondary: "#ecfdf5",
        },
      },
      error: {
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fee2e2",
        },
      },
    }}
  />
);

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
  title?: string;
  label?: string;
  loading?: boolean;
  jobTitle?: string;
  companyName?: string;
}

const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Submit Your Resume",
  label = "Select your resume (PDF)",
  loading = false,
  jobTitle,
  companyName,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
      setFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 p-6 shadow-2xl space-y-5 transition-all">
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <Dialog.Title className="text-xl font-semibold text-white">
              {title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Job info */}
          {jobTitle && companyName && (
            <div className="text-sm text-gray-400">
              Applying for{" "}
              <span className="text-white font-semibold">{jobTitle}</span> at{" "}
              <span className="text-white font-semibold">{companyName}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {label}
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="
                  block w-full rounded-lg bg-zinc-800 text-gray-200 border border-zinc-600
                  file:mr-4 file:py-1 file:px-3
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-zinc-700 file:text-white
                  hover:file:bg-zinc-600
                "
              />
            </div>

            <button
              type="submit"
              disabled={!file}
              className="
                w-full flex items-center justify-center gap-2
                bg-green-600 hover:bg-green-700 disabled:opacity-50
                text-white font-medium py-2 rounded-lg transition
              "
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Submit Resume
                </>
              )}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ResumeUploadModal;
