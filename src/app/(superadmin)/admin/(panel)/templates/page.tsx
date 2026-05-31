import { Metadata } from "next";
import { TemplatesManagement } from "@/components/admin/templates-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Template Management",
  description: "Manage template publish state in the Vinyup Super Admin system.",
  path: "/admin/templates",
  noIndex: true,
});

export default function AdminTemplatesPage() {
  return <TemplatesManagement />;
}
