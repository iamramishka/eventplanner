"use client";

import { useEffect, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDate } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { PlanRecord } from "@/types/admin";

export function PlansManagement() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<PlanRecord | null>(null);
  const [reason, setReason] = useState("Commercial update");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    adminService.getPlans().then((items) => {
      setPlans(items);
      setSelectedId(items[0]?.id ?? "");
      setDraft(items[0] ?? null);
    });
  }, []);

  useEffect(() => {
    const selected = plans.find((item) => item.id === selectedId) ?? null;
    setDraft(selected);
  }, [plans, selectedId]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Plan and subscription management"
        description="Define limits, pricing labels, and core entitlement boundaries for the platform."
      />
      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel className="overflow-hidden">
          {plans.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Guest limit</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {plans.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`cursor-pointer admin-transition hover:bg-slate-50 ${
                        selectedId === item.id ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-950">{item.name}</p>
                        <p className="text-slate-500">{item.features.length} feature groups</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.priceLabel}</td>
                      <td className="px-4 py-3 text-slate-600">{item.guestLimit}</td>
                      <td className="px-4 py-3">
                        <AdminBadge label={item.active ? "active" : "inactive"} tone={item.active ? "success" : "default"} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatAdminDate(item.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <AdminEmptyState
                title="No plans available"
                description="Create a plan definition to start managing subscriptions."
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-6">
          {draft ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Edit plan</h2>
              <Field
                label="Plan name"
                name="name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => (current ? { ...current, name: event.target.value } : current))
                }
              />
              <Field
                label="Price label"
                name="priceLabel"
                value={draft.priceLabel}
                onChange={(event) =>
                  setDraft((current) => (current ? { ...current, priceLabel: event.target.value } : current))
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Guest limit"
                  name="guestLimit"
                  type="number"
                  value={String(draft.guestLimit)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, guestLimit: Number(event.target.value || 0) } : current,
                    )
                  }
                />
                <Field
                  label="Gallery limit"
                  name="galleryLimit"
                  type="number"
                  value={String(draft.galleryLimit)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, galleryLimit: Number(event.target.value || 0) } : current,
                    )
                  }
                />
              </div>
              <Field
                label="Enabled features"
                name="features"
                value={draft.features.join(", ")}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? {
                          ...current,
                          features: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }
                      : current,
                  )
                }
                helperText="Comma-separated for the MVP."
              />
              <Field
                label="Audit reason"
                name="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    if (!draft) {
                      return;
                    }
                    const items = await adminService.updatePlan(draft, reason);
                    setPlans(items);
                    setFeedback(`${draft.name} updated.`);
                  })
                }
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {isPending ? "Saving..." : "Save Plan"}
              </button>
            </div>
          ) : (
            <AdminEmptyState
              title="Select a plan"
              description="Choose a plan to edit limits and pricing."
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
