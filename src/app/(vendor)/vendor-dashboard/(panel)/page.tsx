import { VendorOverviewDashboard } from "@/components/vendor/overview-dashboard";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Dashboard",
  description: "Vendor admin overview.",
  path: "/vendor-dashboard",
  noIndex: true,
});

export default function VendorDashboardPage() {
  return <VendorOverviewDashboard />;
}
