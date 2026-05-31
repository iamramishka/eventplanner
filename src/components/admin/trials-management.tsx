"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDate, getStatusTone } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { TrialRecord } from "@/types/admin";

export function TrialsManagement() {
  const [trials, setTrials] = useState<TrialRecord[]>([]);
  const [reason, setReason] = useState("Trial lifecycle review");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    adminService.getTrials().then(setTrials);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Trial and cleanup system"
        description="Review active, expired, and grace-period trials, then run safe cleanup actions with a recorded reason."
        actions={
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const items = await adminService.runCleanup(reason);
                setTrials(items);
                setFeedback("Expired-trial cleanup batch completed.");
              })
            }
            className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isPending ? "Running cleanup..." : "Run Cleanup"}
          </button>
        }
      />

      <AdminPanel className="p-5">
        <Field
          label="Audit reason"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          helperText="Used for trial extensions and cleanup jobs."
        />
      </AdminPanel>

      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}

      <AdminPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Couple</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Ends</th>
                <th className="px-4 py-3 font-medium">Grace ends</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {trials.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">{item.coupleName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.planName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatAdminDate(item.endsAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatAdminDate(item.graceEndsAt)}</td>
                  <td className="px-4 py-3">
                    <AdminBadge label={item.status} tone={getStatusTone(item.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const items = await adminService.extendTrial(item.coupleId, 3, reason);
                          setTrials(items);
                          setFeedback(`Extended ${item.coupleName}'s trial by 3 days.`);
                        })
                      }
                      className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-70"
                    >
                      Extend 3 days
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
