// src/components/JobOpportunity/DeleteJobModal.tsx
import React from "react";

interface DeleteJobModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  jobTitle?: string;
}

const DeleteJobModal: React.FC<DeleteJobModalProps> = ({
  open,
  onCancel,
  onConfirm,
  loading,
  jobTitle,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-red-500 mb-2">
          Delete Job Listing?
        </h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{jobTitle ?? "this job"}</span>?
        </p>
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
            <span className="text-gray-400 text-lg">Deleting…</span>
          </div>
        ) : (
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-zinc-800"
              onClick={onCancel}
              disabled={loading}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition"
              onClick={onConfirm}
              disabled={loading}
              type="button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteJobModal;
