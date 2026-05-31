"use client";

import { useEffect, useState, useTransition } from "react";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { WeddingVendorRecord } from "@/types/couple";

type VendorFormState = Omit<WeddingVendorRecord, "id" | "weddingSlug"> & {
  linkedBudgetItemId: string;
};

const emptyVendorForm: VendorFormState = {
  name: "",
  category: "Venue",
  phone: "",
  whatsapp: "",
  email: "",
  note: "",
  status: "Shortlisted" as const,
  linkedBudgetItemId: "",
};

export function VendorManagementPage() {
  const [items, setItems] = useState<WeddingVendorRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVendorForm);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => setItems(await coupleService.getVendors());

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Vendors"
        title="Vendor management"
        description="Track which vendors you are considering, contacting, or fully booked without leaving the couple workspace."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <CouplePanel className="p-6">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.category} · {item.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            name: item.name,
                            category: item.category,
                            phone: item.phone,
                            whatsapp: item.whatsapp,
                            email: item.email,
                            note: item.note,
                            status: item.status,
                            linkedBudgetItemId: item.linkedBudgetItemId ?? "",
                          });
                        }}
                        className="rounded-full border border-[#E8DDD7] px-3 py-1.5 text-xs font-semibold text-charcoal"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            await coupleService.deleteVendor(item.id);
                            await load();
                            setNotice("Vendor removed.");
                          })
                        }
                        className="rounded-full border border-[#F2D2D2] px-3 py-1.5 text-xs font-semibold text-[#D95C5C]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.note || "No notes yet."}</p>
                </div>
              ))}
            </div>
          ) : (
            <CoupleEmptyState
              title="No vendors added yet"
              description="Track your first vendor to keep contacts, notes, and booking state together."
            />
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {editingId ? "Edit vendor" : "Add vendor"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                await coupleService.upsertVendor({
                  id: editingId ?? undefined,
                  ...form,
                  linkedBudgetItemId: form.linkedBudgetItemId || undefined,
                });
                await load();
                setNotice(editingId ? "Vendor updated." : "Vendor added.");
                setEditingId(null);
                setForm(emptyVendorForm);
              });
            }}
          >
            <Field
              label="Vendor name"
              name="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Field
              label="Category"
              name="category"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
              <Field
                label="WhatsApp"
                name="whatsapp"
                value={form.whatsapp}
                onChange={(event) =>
                  setForm((current) => ({ ...current, whatsapp: event.target.value }))
                }
              />
            </div>
            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-charcoal">Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as WeddingVendorRecord["status"],
                  }))
                }
                className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
              >
                {["Shortlisted", "Contacted", "Booked"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-charcoal">Notes</span>
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                rows={4}
                className="couple-focus rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyVendorForm);
                }}
                className="rounded-full border border-[#E8DDD7] px-4 py-3 text-sm font-semibold text-charcoal"
              >
                Clear
              </button>
              <SubmitButton
                label={editingId ? "Save Vendor" : "Add Vendor"}
                pendingLabel="Saving..."
                pending={isPending}
              />
            </div>
          </form>
        </CouplePanel>
      </div>
    </div>
  );
}
