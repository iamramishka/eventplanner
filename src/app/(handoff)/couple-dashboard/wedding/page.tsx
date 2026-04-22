import type { Metadata } from "next";
import { WeddingSettingsPage } from "@/components/couple/wedding-settings-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Wedding Settings",
  description: "Manage wedding details inside the couple dashboard.",
  path: "/couple-dashboard/wedding",
  noIndex: true,
});

export default function CoupleWeddingSettingsRoute() {
  return <WeddingSettingsPage />;
}
