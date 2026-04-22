import { Metadata } from "next";
import { SettingsManagement } from "@/components/admin/settings-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "System Settings",
  description: "Manage global settings in the Vinyup Super Admin system.",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  return <SettingsManagement />;
}
