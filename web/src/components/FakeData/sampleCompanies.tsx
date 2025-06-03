import type { Company } from "@/type/company";

const fakeCompanies: Company[] = [
  {
    companyId: 1,
    name: "Acme Technologies",
    email: "contact@acme-tech.com",
    address: "123 Innovation Drive, Singapore 048888",
    description:
      "A leading provider of IoT solutions for smart homes and offices.",
    uploadedDocumentUrl: "/docs/acme-registration.pdf",
    status: "Pending",
  },
  {
    companyId: 2,
    name: "Beta Innovations Pte Ltd",
    email: "info@beta-innovations.com",
    address: "45 Fusion Road, Jurong East, Singapore 609600",
    description: "Specializes in AI-driven analytics platforms for retail.",
    uploadedDocumentUrl: "/docs/beta-license.pdf",
    status: "Verified",
  },
  {
    companyId: 3,
    name: "Gamma Solutions",
    email: "hello@gammasolutions.sg",
    address: "7 Pioneer Crescent, Singapore 628565",
    description: "Offers end-to-end cybersecurity consulting for SMEs.",
    uploadedDocumentUrl: "/docs/gamma-doc.pdf",
    status: "Rejected",
  },
  {
    companyId: 4,
    name: "Delta Ventures",
    email: "support@deltaventures.com",
    address: "89 Market Street, #15-01, Singapore 048950",
    description: "Venture capital firm focused on clean-energy startups.",
    uploadedDocumentUrl: "/docs/delta-proof.pdf",
    status: "Pending",
  },
  {
    companyId: 5,
    name: "Epsilon Logistics",
    email: "operations@epsilonlogistics.com",
    address: "10 Pasir Ris Drive, Singapore 519427",
    description:
      "Regional freight and warehousing services across Southeast Asia.",
    uploadedDocumentUrl: "/docs/epsilon-registration.pdf",
    status: "Verified",
  },
];

export { fakeCompanies };
