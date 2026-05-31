import { VendorVisibilityPage } from "@/components/vendor/vendor-visibility-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Visibility",
  description: "Vendor public visibility and approval state.",
  path: "/vendor-dashboard/visibility",
  noIndex: true,
});

export default function VendorVisibilityRoute() {
  return <VendorVisibilityPage />;
}
