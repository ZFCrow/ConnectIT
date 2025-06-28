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
