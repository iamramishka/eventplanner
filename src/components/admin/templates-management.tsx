"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDate, getStatusTone } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { TemplateAdminRecord } from "@/types/admin";

export function TemplatesManagement() {
  const [templates, setTemplates] = useState<TemplateAdminRecord[]>([]);
  const [reason, setReason] = useState("Template governance update");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    adminService.getTemplates().then(setTemplates);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="Template management"
        description="Govern invitation templates as reusable platform assets with simple publish-state control for the MVP."
      />
      <AdminPanel className="p-5">
        <Field
          label="Audit reason"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </AdminPanel>
      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}
      <AdminPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Template</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {templates.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.version}</td>
                  <td className="px-4 py-3 text-slate-600">{item.tags.join(", ")}</td>
                  <td className="px-4 py-3">
                    <AdminBadge label={item.status} tone={getStatusTone(item.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatAdminDate(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const items = await adminService.toggleTemplateStatus(item.id, reason);
                          setTemplates(items);
                          setFeedback(`${item.name} status updated.`);
                        })
                      }
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-70"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
