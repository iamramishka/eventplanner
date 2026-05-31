import { Metadata } from "next";
import { ReportsAnalytics } from "@/components/admin/reports-analytics";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reports & Analytics",
  description: "View reports and analytics in the Vinyup Super Admin system.",
  path: "/admin/reports",
  noIndex: true,
});

export default function AdminReportsPage() {
  return <ReportsAnalytics />;
}
