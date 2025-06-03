// src/pages/company/CompanyVerificationPage.tsx
import React, { useState, useMemo } from "react";
import CompanyCard from "../components/companyCard";
import { fakeCompanies } from "../components/FakeData/sampleCompanies"; // Adjust the import path as needed
// src/pages/company/CompanyVerificationPage.tsx (or wherever you need it)

type Tab = "Pending" | "Accepted" | "Rejected";

const CompanyVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");

  // Map "Accepted" tab to status === "Verified"
  const filteredCompanies = useMemo(() => {
    return fakeCompanies.filter((c) => {
      if (activeTab === "Pending") return c.status === "Pending";
      if (activeTab === "Accepted") return c.status === "Verified";
      if (activeTab === "Rejected") return c.status === "Rejected";
      return false;
    });
  }, [activeTab]);

  const handleVerify = (companyId: number) => {
    console.log("Verifying company:", companyId);
    // TODO: call API or update state to mark as Verified
  };

  const handleReject = (companyId: number) => {
    console.log("Rejecting company:", companyId);
    // TODO: call API or update state to mark as Rejected
  };

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold py-4 px-2">Company Verification</h1>
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-6">
        {(["Pending", "Verified", "Rejected"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 -mb-px font-medium text-sm
              ${
                activeTab === tab
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400 hover:text-gray-200"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Company Cards List */}
      {filteredCompanies.length > 0 ? (
        <ul className="space-y-5">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.companyId}
              company={company}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No companies in this category.</p>
      )}
    </div>
  );
};

export default CompanyVerificationPage;
