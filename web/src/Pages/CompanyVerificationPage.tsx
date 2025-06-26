// src/pages/company/CompanyVerificationPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import CompanyCard from "../components/companyCard";
import { Company, getCompanyStatus } from "@/type/account";
import axios from "axios";
import LoadingSpinner from "@/components/ui/loading-circle";
// src/pages/company/CompanyVerificationPage.tsx (or wherever you need it)

type Tab = "Pending" | "Verified" | "Rejected";

const CompanyVerificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/profile/getAllCompanies");
        setCompanies(res.data); // Assuming the API returns an array of companies
      } catch (err) {
        console.error("Failed to fetch companies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);
  // Filter companies according to tab
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const status = getCompanyStatus(c.verified);
      if (activeTab === "Pending") return status === "Pending";
      if (activeTab === "Verified") return status === "Verified";
      if (activeTab === "Rejected") return status === "Rejected";
      return false;
    });
  }, [activeTab, companies]);

  const handleVerify = async (companyId: number) => {
    try {
      // 1 = Verified
      setCompanies((prev) =>
        prev.map((c) => (c.companyId === companyId ? { ...c, verified: 1 } : c))
      );
      await axios.post(`/api/profile/setCompanyVerified/${companyId}/1`);
      // Optionally: refresh company list or update state here
    } catch (err) {
      console.error("Failed to verify company:", err);
      setCompanies(
        (prev) =>
          prev.map((c) =>
            c.companyId === companyId ? { ...c, verified: 0 } : c
          ) // change back to pending if error occurs
      );
    }
  };

  const handleReject = async (companyId: number) => {
    try {
      setCompanies((prev) =>
        prev.map((c) => (c.companyId === companyId ? { ...c, verified: 2 } : c))
      );
      await axios.post(`/api/profile/setCompanyVerified/${companyId}/2`);
      console.log("Company rejected:", companyId);

      // Optionally: refresh company list or update state here
    } catch (err) {
      console.error("Failed to reject company:", err);
      setCompanies(
        (prev) =>
          prev.map((c) =>
            c.companyId === companyId ? { ...c, verified: 0 } : c
          ) // change back to pending if error occurs
      );
    }
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
            {tab} (
            {
              companies.filter((c) => getCompanyStatus(c.verified) === tab)
                .length
            }
            )
          </button>
        ))}
      </div>

      {/* Company Cards List */}
      {loading ? (
        <LoadingSpinner
          message="Loading companies..."
          className="flex items-center justify-center py-16"
        />
      ) : filteredCompanies.length > 0 ? (
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
