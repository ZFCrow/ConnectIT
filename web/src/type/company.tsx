// src/type/company.ts

export interface Company {
  companyId: number;
  name: string;
  //   registrationNumber: string;
  email: string;
  location?: string;
  description?: string; // Optional description of the company
  //   phone: string;
  uploadedDocumentUrl: string; // URL or path to the verification document
  verified: 0 | 1 | 2;
}
export function getCompanyStatus(
  verified: 0 | 1 | 2
): "Pending" | "Verified" | "Rejected" {
  switch (verified) {
    case 1:
      return "Verified";
    case 2:
      return "Rejected";
    case 0:
    default:
      return "Pending";
  }
}
