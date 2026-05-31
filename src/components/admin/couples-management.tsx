"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDate, getStatusTone } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { CoupleRecord } from "@/types/admin";

export function CouplesManagement() {
  const [couples, setCouples] = useState<CoupleRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reason, setReason] = useState("Operational review");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    adminService.getCouples().then((items) => {
      setCouples(items);
      setSelectedId(items[0]?.id ?? "");
    });
  }, []);

  const filtered = useMemo(
    () =>
      couples.filter((item) => {
        const matchesSearch =
          !deferredSearch ||
          item.fullName.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          item.email.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          item.weddingSlug.toLowerCase().includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [couples, deferredSearch, statusFilter],
  );

  const selected = filtered.find((item) => item.id === selectedId) ?? couples.find((item) => item.id === selectedId) ?? null;

  const runAction = (action: () => Promise<CoupleRecord[]>, message: string) => {
    startTransition(async () => {
      const items = await action();
      setCouples(items);
      setFeedback(message);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Accounts"
        title="Couple management"
        description="Search, review, and control account state for couple workspaces without entering the couple product directly."
      />

      <AdminPanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_280px]">
          <Field
            label="Search couples"
            name="search"
            value={search}
            placeholder="Name, email, or wedding slug"
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="admin-focus w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              {["all", "active", "trial", "expired", "suspended", "deleted"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Action reason"
            name="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            helperText="Stored in the admin audit log for all mutations."
          />
        </div>
      </AdminPanel>

      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel className="overflow-hidden">
          {filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Couple</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">RSVP</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`cursor-pointer admin-transition hover:bg-slate-50 ${
                        selectedId === item.id ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-950">{item.fullName}</p>
                        <p className="text-slate-500">{item.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.planName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.guestCount}</td>
                      <td className="px-4 py-3 text-slate-600">{item.rsvpRate}%</td>
                      <td className="px-4 py-3">
                        <AdminBadge label={item.status} tone={getStatusTone(item.status)} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatAdminDate(item.lastActiveAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <AdminEmptyState
                title="No couples match these filters"
                description="Adjust the search query or status filter to continue."
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-6">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{selected.fullName}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.email}</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Wedding slug: <strong className="text-slate-900">{selected.weddingSlug}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Created: <strong className="text-slate-900">{formatAdminDate(selected.createdAt)}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Notes: <strong className="text-slate-900">{selected.notes ?? "No notes"}</strong>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.updateCoupleStatus(selected.id, "active", reason),
                      `${selected.fullName} reactivated.`,
                    )
                  }
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Reactivate
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.updateCoupleStatus(selected.id, "suspended", reason),
                      `${selected.fullName} suspended.`,
                    )
                  }
                  className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Suspend
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await adminService.extendTrial(selected.id, 3, reason);
                      const items = await adminService.getCouples();
                      setCouples(items);
                      setFeedback(`Trial extended for ${selected.fullName}.`);
                    })
                  }
                  className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Extend Trial
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.deleteCouple(selected.id, reason),
                      `${selected.fullName} marked as deleted.`,
                    )
                  }
                  className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Soft Delete
                </button>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="Select a couple"
              description="Choose a row from the table to review account details and actions."
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
