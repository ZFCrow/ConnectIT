import React from "react";
import { FileText, Mail, MapPin } from "lucide-react";
import { Company } from "@/type/account";
import { getCompanyStatus } from "@/utility/getCompanyStatus";
import PdfViewerModal from "./PortfolioModal";

interface CompanyCardProps {
  company: Company;
  onVerify: (id: number) => void;
  onReject: (id: number) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onVerify,
  onReject,
}) => {
  const [pdfOpen, setPdfOpen] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);

  return (
    <li className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg flex justify-between items-center">
      {/* Left: Company Info */}
      <div className="space-y-2 flex-1 pr-6">
        {/* Company Name + Status Badge */}
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-gray-100">
            {company.name}
          </h3>
          <span
            className={
              `px-2 py-1 rounded text-xs font-medium ` +
              (getCompanyStatus(company.verified) === "Pending"
                ? "bg-yellow-500 text-black"
                : getCompanyStatus(company.verified) === "Verified"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white")
            }
          >
            {getCompanyStatus(company.verified)}
          </span>
        </div>

        {/* Address, Email, and Document View in One Row */}
        <div className="flex items-center space-x-6 text-gray-300">
          {company.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-sm">{company.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4 text-indigo-400" />
            <span className="text-sm">{company.email}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPdfUrl(
                `/api/profile/companydoc/view?uri=${encodeURIComponent(
                  company.companyDocUrl || ""
                )}`
              );
              setPdfOpen(true);
            }}
            className="flex items-center space-x-1 text-indigo-400 hover:underline text-sm"
          >
            <FileText className="w-5 h-5" />
            <span>View Document</span>
          </button>
        </div>

        {/* Description (below row) */}
        {company.description && (
          <p className="text-gray-200 text-sm pt-2">{company.description}</p>
        )}
      </div>

      {/* Right: Actions in a row, vertically centered */}
      <div className="flex flex-row space-x-2">
        {getCompanyStatus(company.verified) === "Pending" && (
          <>
            <button
              onClick={() => onVerify(company.companyId)}
              className="border border-green-500 text-green-500 bg-transparent px-3 py-1 rounded text-sm font-medium hover:bg-green-600 hover:text-white transition"
            >
              Verify
            </button>
            <button
              onClick={() => onReject(company.companyId)}
              className="border border-red-500 text-red-500 bg-transparent px-3 py-1 rounded text-sm font-medium hover:bg-red-600 hover:text-white transition"
            >
              Reject
            </button>
          </>
        )}
      </div>

      <PdfViewerModal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        pdfUrl={pdfUrl}
        title="Viewing Company Document"
      />
    </li>
  );
};

export default CompanyCard;
