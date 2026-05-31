"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDateTime, getStatusTone } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { AuditLogRecord, SupportInquiryRecord, SystemLogRecord } from "@/types/admin";

export function LogsSupport() {
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLogRecord[]>([]);
  const [support, setSupport] = useState<SupportInquiryRecord[]>([]);
  const [reason, setReason] = useState("Support resolution");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      adminService.getAuditLogs(),
      adminService.getSystemLogs(),
      adminService.getSupportInquiries(),
    ]).then(([audit, system, supportItems]) => {
      setAuditLogs(audit);
      setSystemLogs(system);
      setSupport(supportItems);
    });
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Logs and support"
        description="Review audit activity, runtime signals, and lightweight support inquiries from one operational workspace."
      />

      <AdminPanel className="p-5">
        <Field
          label="Audit reason for support actions"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </AdminPanel>

      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}

      <div className="grid gap-6">
        <AdminPanel className="p-6">
          <h2 className="text-lg font-semibold text-slate-950">Support inquiries</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {support.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">{item.senderName}</p>
                      <p className="text-slate-500">{item.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.subject}</td>
                    <td className="px-4 py-3">
                      <AdminBadge label={item.status} tone={item.status === "resolved" ? "success" : "warning"} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatAdminDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isPending || item.status === "resolved"}
                        onClick={() =>
                          startTransition(async () => {
                            const next = await adminService.resolveSupportInquiry(item.id, reason);
                            setSupport(next);
                            setAuditLogs(await adminService.getAuditLogs());
                            setFeedback(`${item.subject} marked resolved.`);
                          })
                        }
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminPanel className="p-6">
            <h2 className="text-lg font-semibold text-slate-950">Admin audit log</h2>
            <div className="mt-5 space-y-4">
              {auditLogs.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-950">{item.action}</p>
                    <AdminBadge label={item.targetType} tone="info" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.targetLabel} · {item.reason}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">{formatAdminDateTime(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel className="p-6">
            <h2 className="text-lg font-semibold text-slate-950">System log snapshot</h2>
            <div className="mt-5 space-y-4">
              {systemLogs.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-950">{item.source}</p>
                    <AdminBadge label={item.level} tone={getStatusTone(item.level === "error" ? "suspended" : item.level === "warning" ? "pending" : "draft")} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatAdminDateTime(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
