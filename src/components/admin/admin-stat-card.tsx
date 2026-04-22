import { AdminOverviewMetric } from "@/types/admin";
import { AdminBadge } from "@/components/admin/admin-badge";

type AdminStatCardProps = {
  metric: AdminOverviewMetric;
};

export function AdminStatCard({ metric }: AdminStatCardProps) {
  return (
    <article className="admin-panel rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{metric.label}</p>
        <AdminBadge label={metric.change} tone={metric.tone ?? "default"} />
      </div>
      <p className="mt-5 text-4xl font-semibold text-slate-950">{metric.value}</p>
    </article>
  );
}
