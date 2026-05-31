import type { Metadata } from "next";
import { RsvpManagementPage } from "@/components/couple/rsvp-management-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "RSVP Management",
  description: "Track and manage RSVP updates inside the couple dashboard.",
  path: "/couple-dashboard/rsvps",
  noIndex: true,
});

export default function CoupleRsvpsRoute() {
  return <RsvpManagementPage />;
}
