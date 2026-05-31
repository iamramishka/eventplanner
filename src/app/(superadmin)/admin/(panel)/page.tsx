import { Metadata } from "next";
import { DashboardOverview } from "@/components/admin/dashboard-overview";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Super Admin Dashboard",
  description: "Operational overview for the Vinyup Super Admin system.",
  path: "/admin",
  noIndex: true,
});

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
