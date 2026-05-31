import { Metadata } from "next";
import { PlansManagement } from "@/components/admin/plans-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Plan Management",
  description: "Manage plans and subscription limits in the Vinyup Super Admin system.",
  path: "/admin/plans",
  noIndex: true,
});

export default function AdminPlansPage() {
  return <PlansManagement />;
}
