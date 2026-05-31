import type { Metadata } from "next";
import { ChecklistPage } from "@/components/couple/checklist-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Checklist",
  description: "Manage planning tasks inside the couple dashboard.",
  path: "/couple-dashboard/checklist",
  noIndex: true,
});

export default function CoupleChecklistRoute() {
  return <ChecklistPage />;
}
