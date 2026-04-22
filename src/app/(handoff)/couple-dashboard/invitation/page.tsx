import type { Metadata } from "next";
import { InvitationWorkspacePage } from "@/components/couple/invitation-workspace-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Invitation Website",
  description: "Manage invitation content, sections, theme, gallery, and music inside the couple dashboard.",
  path: "/couple-dashboard/invitation",
  noIndex: true,
});

export default function CoupleInvitationRoute() {
  return <InvitationWorkspacePage />;
}
