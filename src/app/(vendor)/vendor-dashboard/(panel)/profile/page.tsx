import { VendorProfilePage } from "@/components/vendor/vendor-profile-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Profile",
  description: "Vendor profile management.",
  path: "/vendor-dashboard/profile",
  noIndex: true,
});

export default function VendorProfileRoute() {
  return <VendorProfilePage />;
}
