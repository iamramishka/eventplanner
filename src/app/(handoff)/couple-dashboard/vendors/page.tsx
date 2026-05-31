import type { Metadata } from "next";
import { VendorManagementPage } from "@/components/couple/vendor-management-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Vendors",
  description: "Manage wedding vendors inside the couple dashboard.",
  path: "/couple-dashboard/vendors",
  noIndex: true,
});

export default function CoupleVendorsRoute() {
  return <VendorManagementPage />;
}
