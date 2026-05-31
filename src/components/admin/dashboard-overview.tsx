"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { adminService } from "@/lib/services/admin-service";
import { AdminOverviewData } from "@/types/admin";
import { formatAdminDateTime } from "@/lib/admin-utils";

export function DashboardOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);

  useEffect(() => {
    adminService.getOverview().then(setData);
  }, []);

  if (!data) {
    return <div className="text-sm text-slate-600">Loading dashboard overview...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Overview"
        title="Platform operations at a glance"
        description="This dashboard keeps the super admin focused on operational health, queues, and recent sensitive changes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <AdminStatCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminPanel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Actionable alerts</h2>
            <Link href="/admin/logs" className="text-sm font-semibold text-sky-700">
              View logs
            </Link>
          </div>
          <div className="mt-5 grid gap-4">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{alert.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{alert.description}</p>
                  </div>
                  <AdminBadge label={alert.tone ?? "default"} tone={alert.tone ?? "default"} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Recent admin actions</h2>
            <Link href="/admin/logs" className="text-sm font-semibold text-sky-700">
              Audit trail
            </Link>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Reason</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.recentActions.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.action}</td>
                    <td className="px-4 py-3 text-slate-600">{item.targetLabel}</td>
                    <td className="px-4 py-3 text-slate-600">{item.reason}</td>
                    <td className="px-4 py-3 text-slate-500">{formatAdminDateTime(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
