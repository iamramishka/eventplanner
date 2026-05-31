import { Metadata } from "next";
import { CouplesManagement } from "@/components/admin/couples-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Couple Management",
  description: "Manage couple accounts in the Vinyup Super Admin system.",
  path: "/admin/couples",
  noIndex: true,
});

export default function AdminCouplesPage() {
  return <CouplesManagement />;
}
