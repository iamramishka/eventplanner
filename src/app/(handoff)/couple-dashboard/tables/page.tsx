import type { Metadata } from "next";
import { TableAssignmentPage } from "@/components/couple/table-assignment-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Table Assignment",
  description: "Manage table assignments inside the couple dashboard.",
  path: "/couple-dashboard/tables",
  noIndex: true,
});

export default function CoupleTablesRoute() {
  return <TableAssignmentPage />;
}
