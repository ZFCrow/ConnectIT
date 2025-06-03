// src/type/company.ts

export interface Company {
  companyId: number;
  name: string;
  //   registrationNumber: string;
  email: string;
  address?: string;
  description?: string; // Optional description of the company
  //   phone: string;
  uploadedDocumentUrl: string; // URL or path to the verification document
  status: "Pending" | "Verified" | "Rejected";
}
