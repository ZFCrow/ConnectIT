// src/components/CompanyCard.tsx
import React from "react";
import { FileText, Mail, MapPin } from "lucide-react";
import { getCompanyStatus, type Company } from "../type/company";

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
  return (
    <li className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-start">
        {/* Company Info */}
        <div className="space-y-2">
          {/* Company Name */}
          <h3 className="text-xl font-semibold text-gray-100">
            {company.name}
          </h3>

          {/* Address and Email on the Same Line */}
          <div className="flex items-center space-x-6 text-gray-300">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-sm">{company.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span className="text-sm">{company.email}</span>
            </div>
          </div>

          {/* Description (below address & email) */}
          {company.description && (
            <p className="text-gray-200 text-sm">{company.description}</p>
          )}
        </div>

        {/* “View Document” link */}
        <a
          href={company.uploadedDocumentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-indigo-400 hover:underline"
        >
          <FileText className="w-5 h-5" />
          <span className="text-sm">View Document</span>
        </a>
      </div>

      {/* Status badge + actions */}
      <div className="mt-4 flex justify-between items-center">
        <span
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${
              getCompanyStatus(company.verified) === "Pending"
                ? "bg-yellow-500 text-black"
                : getCompanyStatus(company.verified) === "Verified"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }
          `}
        >
          {getCompanyStatus(company.verified)}
        </span>

        {getCompanyStatus(company.verified) === "Pending" && (
          <div className="space-x-2">
            <button
              onClick={() => onVerify(company.companyId)}
              className="
                border border-green-500 text-green-500 bg-transparent
                px-3 py-1 rounded text-sm font-medium
                hover:bg-green-600 hover:text-white transition
              "
            >
              Verify
            </button>
            <button
              onClick={() => onReject(company.companyId)}
              className="
                border border-red-500 text-red-500 bg-transparent
                px-3 py-1 rounded text-sm font-medium
                hover:bg-red-600 hover:text-white transition
              "
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default CompanyCard;
