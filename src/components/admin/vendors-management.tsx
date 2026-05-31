"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { AdminBadge } from "@/components/admin/admin-badge";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { formatAdminDate, getStatusTone } from "@/lib/admin-utils";
import { adminService } from "@/lib/services/admin-service";
import { VendorRecord } from "@/types/admin";

export function VendorsManagement() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reason, setReason] = useState("Vendor review");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    adminService.getVendors().then((items) => {
      setVendors(items);
      setSelectedId(items[0]?.id ?? "");
    });
  }, []);

  const filtered = useMemo(
    () =>
      vendors.filter((item) => {
        const matchesSearch =
          !deferredSearch ||
          item.businessName.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          item.contactName.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          item.location.toLowerCase().includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [vendors, deferredSearch, statusFilter],
  );

  const selected = filtered.find((item) => item.id === selectedId) ?? vendors.find((item) => item.id === selectedId) ?? null;

  const runAction = (action: () => Promise<VendorRecord[]>, message: string) => {
    startTransition(async () => {
      const items = await action();
      setVendors(items);
      setFeedback(message);
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Accounts"
        title="Vendor management"
        description="Review vendor applications, approve or suspend partners, and control highlighted vendor visibility."
      />

      <AdminPanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_280px]">
          <Field
            label="Search vendors"
            name="search"
            value={search}
            placeholder="Business, contact, or location"
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="admin-focus w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900"
            >
              {["all", "pending", "approved", "rejected", "suspended"].map((item) => (
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
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Featured</th>
                    <th className="px-4 py-3 font-medium">Created</th>
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
                        <p className="font-medium text-slate-950">{item.businessName}</p>
                        <p className="text-slate-500">{item.contactName}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3 text-slate-600">{item.location}</td>
                      <td className="px-4 py-3">
                        <AdminBadge label={item.status} tone={getStatusTone(item.status)} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.featured ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 text-slate-500">{formatAdminDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <AdminEmptyState
                title="No vendors match these filters"
                description="Adjust the filters to review vendors."
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel className="p-6">
          {selected ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{selected.businessName}</h2>
                <p className="mt-1 text-sm text-slate-500">{selected.email}</p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Contact: <strong className="text-slate-900">{selected.contactName}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Category: <strong className="text-slate-900">{selected.category}</strong>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Location: <strong className="text-slate-900">{selected.location}</strong>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.updateVendorStatus(selected.id, "approved", reason),
                      `${selected.businessName} approved.`,
                    )
                  }
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.updateVendorStatus(selected.id, "rejected", reason),
                      `${selected.businessName} rejected.`,
                    )
                  }
                  className="rounded-2xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => adminService.updateVendorStatus(selected.id, "suspended", reason),
                      `${selected.businessName} suspended.`,
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
                    runAction(
                      () => adminService.toggleVendorFeature(selected.id, reason),
                      `Featured flag updated for ${selected.businessName}.`,
                    )
                  }
                  className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  Toggle Feature
                </button>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              title="Select a vendor"
              description="Choose a vendor row to review approval actions."
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
