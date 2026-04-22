"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { adminService } from "@/lib/services/admin-service";
import { ReportSnapshot } from "@/types/admin";

export function ReportsAnalytics() {
  const [reports, setReports] = useState<ReportSnapshot[]>([]);

  useEffect(() => {
    adminService.getReports().then(setReports);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Intelligence"
        title="Reports and analytics"
        description="MVP analytics focus on operational reporting and headline conversion indicators rather than deep BI tooling."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {reports.map((item) => (
          <AdminPanel key={item.id} className="p-6">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </AdminPanel>
        ))}
      </div>
      <AdminPanel className="p-6">
        <h2 className="text-lg font-semibold text-slate-950">Reporting notes</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          In the current implementation these are seeded snapshots representing the reports module. The production-ready next step would be a scheduled aggregation pipeline with exportable date ranges and saved filters.
        </p>
      </AdminPanel>
    </div>
  );
}
