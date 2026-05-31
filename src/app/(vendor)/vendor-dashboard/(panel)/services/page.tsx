import { VendorServicesPage } from "@/components/vendor/vendor-services-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Services",
  description: "Vendor services and packages management.",
  path: "/vendor-dashboard/services",
  noIndex: true,
});

export default function VendorServicesRoute() {
  return <VendorServicesPage />;
}
