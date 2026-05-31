import { VendorGalleryPage } from "@/components/vendor/vendor-gallery-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Vendor Gallery",
  description: "Vendor gallery management.",
  path: "/vendor-dashboard/gallery",
  noIndex: true,
});

export default function VendorGalleryRoute() {
  return <VendorGalleryPage />;
}
