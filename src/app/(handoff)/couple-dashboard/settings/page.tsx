import type { Metadata } from "next";
import { CoupleSettingsPage } from "@/components/couple/couple-settings-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Account Settings",
  description: "Review subscription and account information inside the couple dashboard.",
  path: "/couple-dashboard/settings",
  noIndex: true,
});

export default function CoupleSettingsRoute() {
  return <CoupleSettingsPage />;
}
