import { Metadata } from "next";
import { LogsSupport } from "@/components/admin/logs-support";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Logs & Support",
  description: "Review logs, audit activity, and support items in the Vinyup Super Admin system.",
  path: "/admin/logs",
  noIndex: true,
});

export default function AdminLogsPage() {
  return <LogsSupport />;
}
