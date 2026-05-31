import type { Metadata } from "next";
import { OverviewDashboard } from "@/components/couple/overview-dashboard";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Couple Dashboard",
  description:
    "Private planning workspace for couples managing guests, RSVPs, invitation settings, budget, and wedding operations.",
  path: "/couple-dashboard",
  noIndex: true,
});

export default function CoupleDashboardPage() {
  return <OverviewDashboard />;
}
