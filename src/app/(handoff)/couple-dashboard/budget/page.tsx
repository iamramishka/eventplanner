import type { Metadata } from "next";
import { BudgetPlannerPage } from "@/components/couple/budget-planner-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Budget Planner",
  description: "Manage wedding budget planning inside the couple dashboard.",
  path: "/couple-dashboard/budget",
  noIndex: true,
});

export default function CoupleBudgetRoute() {
  return <BudgetPlannerPage />;
}
