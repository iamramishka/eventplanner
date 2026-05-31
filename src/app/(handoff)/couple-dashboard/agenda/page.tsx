import type { Metadata } from "next";
import { AgendaPage } from "@/components/couple/agenda-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Agenda",
  description: "Manage wedding agenda items inside the couple dashboard.",
  path: "/couple-dashboard/agenda",
  noIndex: true,
});

export default function CoupleAgendaRoute() {
  return <AgendaPage />;
}
