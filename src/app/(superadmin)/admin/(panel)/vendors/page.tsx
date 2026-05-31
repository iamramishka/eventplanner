import { Metadata } from "next";
import { VendorsManagement } from "@/components/admin/vendors-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Vendor Management",
  description: "Manage vendor approvals and vendor states in the Vinyup Super Admin system.",
  path: "/admin/vendors",
  noIndex: true,
});

export default function AdminVendorsPage() {
  return <VendorsManagement />;
}
