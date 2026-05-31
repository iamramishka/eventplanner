import { VendorSettingsPage } from "@/components/vendor/vendor-settings-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Settings",
  description: "Vendor account settings.",
  path: "/vendor-dashboard/settings",
  noIndex: true,
});

export default function VendorSettingsRoute() {
  return <VendorSettingsPage />;
}
