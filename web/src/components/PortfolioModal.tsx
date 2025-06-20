import React from "react";
import { Dialog } from "@headlessui/react";
import { X, FileText } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string; // URL or object URL from uploaded file
  title?: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  title = "Viewing Portfolio",
}) => {
  const cacheBustedUrl = `${pdfUrl}?t=${Date.now()}`
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl h-[80vh] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 shadow-2xl transition-all flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-700 bg-zinc-800">
            <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              {title}
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={cacheBustedUrl}
              title="PDF Preview"
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PdfViewerModal;