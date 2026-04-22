import { Metadata } from "next";
import { TrialsManagement } from "@/components/admin/trials-management";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Trials & Cleanup",
  description: "Monitor trials and cleanup flows in the Vinyup Super Admin system.",
  path: "/admin/trials",
  noIndex: true,
});

export default function AdminTrialsPage() {
  return <TrialsManagement />;
}
