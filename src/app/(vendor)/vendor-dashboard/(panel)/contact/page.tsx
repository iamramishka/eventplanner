import { VendorContactPage } from "@/components/vendor/vendor-contact-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Contact Info",
  description: "Vendor contact and social information.",
  path: "/vendor-dashboard/contact",
  noIndex: true,
});

export default function VendorContactRoute() {
  return <VendorContactPage />;
}
