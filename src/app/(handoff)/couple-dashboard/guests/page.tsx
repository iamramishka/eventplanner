import type { Metadata } from "next";
import { GuestManagementPage } from "@/components/couple/guest-management-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Guest Management",
  description: "Manage guests and invite access inside the couple dashboard.",
  path: "/couple-dashboard/guests",
  noIndex: true,
});

export default function CoupleGuestsRoute() {
  return <GuestManagementPage />;
}
