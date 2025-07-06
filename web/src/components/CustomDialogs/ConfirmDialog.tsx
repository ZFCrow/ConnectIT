import React from "react";
import { Dialog } from "@headlessui/react";
import { X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onConfirm(password);
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500 w-5 h-5" />
              {title}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <p className="text-sm text-gray-300">{description}</p>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-400">
                Enter your password to confirm:
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

          {/* Actions */}
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
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-zinc-700 hover:bg-zinc-600 text-gray-100"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {confirmText}
            </button>
          </div>
        )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmModal;