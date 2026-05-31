import { CoupleStatus, VendorStatus } from "@/types/admin";

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatAdminDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getStatusTone(
  status: CoupleStatus | VendorStatus | "active" | "inactive" | "draft" | "published" | "expired" | "grace" | "cleaned",
) {
  switch (status) {
    case "active":
    case "approved":
    case "published":
      return "success";
    case "trial":
    case "pending":
    case "grace":
      return "warning";
    case "expired":
    case "rejected":
    case "inactive":
      return "default";
    case "suspended":
    case "deleted":
    case "cleaned":
      return "danger";
    case "draft":
      return "info";
    default:
      return "default";
  }
}
