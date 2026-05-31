"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { formatCoupleCurrency } from "@/lib/couple-utils";
import { coupleService } from "@/lib/services/couple-service";
import { BudgetCategory, BudgetItemRecord } from "@/types/couple";

type BudgetFormState = Omit<BudgetItemRecord, "id" | "weddingSlug"> & {
  dueDate: string;
};

const categories: BudgetCategory[] = [
  "Venue",
  "Catering",
  "Photography",
  "Videography",
  "Decor",
  "Dress",
  "Makeup",
  "Cake",
  "Jewelry",
  "Music",
  "Transport",
  "Liquor",
  "Gifts",
  "Other",
];

const emptyBudgetForm: BudgetFormState = {
  category: "Venue" as BudgetCategory,
  title: "",
  estimatedAmount: 0,
  actualAmount: 0,
  paidAmount: 0,
  note: "",
  dueDate: "",
  status: "planned" as const,
};

export function BudgetPlannerPage() {
  const [items, setItems] = useState<BudgetItemRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyBudgetForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => setItems(await coupleService.getBudgetItems());

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(
    () => ({
      estimated: items.reduce((total, item) => total + item.estimatedAmount, 0),
      actual: items.reduce((total, item) => total + item.actualAmount, 0),
      paid: items.reduce((total, item) => total + item.paidAmount, 0),
    }),
    [items],
  );

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Budget"
        title="Budget planner"
        description="Track estimated, actual, and paid amounts in one practical planning view."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Estimated", value: formatCoupleCurrency(summary.estimated) },
          { label: "Actual", value: formatCoupleCurrency(summary.actual) },
          { label: "Paid", value: formatCoupleCurrency(summary.paid) },
        ].map((item) => (
          <CouplePanel key={item.label} className="p-5">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-charcoal">{item.value}</p>
          </CouplePanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CouplePanel className="overflow-hidden">
          {items.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#EEE3DD] text-left text-sm">
                <thead className="bg-[#FCF8F6] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Estimated</th>
                    <th className="px-4 py-3 font-medium">Actual</th>
                    <th className="px-4 py-3 font-medium">Paid</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6E0] bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="transition-soft hover:bg-[#FFF9F7]">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-charcoal">{item.title}</p>
                        <p className="text-muted">{item.status}</p>
                      </td>
                      <td className="px-4 py-4 text-muted">{item.category}</td>
                      <td className="px-4 py-4 text-muted">{formatCoupleCurrency(item.estimatedAmount)}</td>
                      <td className="px-4 py-4 text-muted">{formatCoupleCurrency(item.actualAmount)}</td>
                      <td className="px-4 py-4 text-muted">{formatCoupleCurrency(item.paidAmount)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setForm({
                                category: item.category,
                                title: item.title,
                                estimatedAmount: item.estimatedAmount,
                                actualAmount: item.actualAmount,
                                paidAmount: item.paidAmount,
                                note: item.note,
                                dueDate: item.dueDate ?? "",
                                status: item.status,
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
                                await coupleService.deleteBudgetItem(item.id);
                                await load();
                                setNotice("Budget item removed.");
                              })
                            }
                            className="rounded-full border border-[#F2D2D2] px-3 py-1.5 text-xs font-semibold text-[#D95C5C]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <CoupleEmptyState
                title="No budget items yet"
                description="Add your first expense to start tracking spending and what is still due."
              />
            </div>
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {editingId ? "Edit budget item" : "Add budget item"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              startTransition(async () => {
                try {
                  await coupleService.upsertBudgetItem({
                    id: editingId ?? undefined,
                    ...form,
                  });
                  await load();
                  setNotice(editingId ? "Budget item updated." : "Budget item added.");
                  setEditingId(null);
                  setForm(emptyBudgetForm);
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error
                      ? caughtError.message
                      : "Budget item could not be saved.",
                  );
                }
              });
            }}
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-charcoal">Category</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as BudgetCategory,
                  }))
                }
                className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Title"
              name="title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Estimated"
                name="estimatedAmount"
                type="number"
                value={String(form.estimatedAmount)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    estimatedAmount: Number(event.target.value || 0),
                  }))
                }
              />
              <Field
                label="Actual"
                name="actualAmount"
                type="number"
                value={String(form.actualAmount)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    actualAmount: Number(event.target.value || 0),
                  }))
                }
              />
              <Field
                label="Paid"
                name="paidAmount"
                type="number"
                value={String(form.paidAmount)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paidAmount: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Due date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as "planned" | "booked" | "paid",
                    }))
                  }
                  className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                >
                  {["planned", "booked", "paid"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
                  setForm(emptyBudgetForm);
                }}
                className="rounded-full border border-[#E8DDD7] px-4 py-3 text-sm font-semibold text-charcoal"
              >
                Clear
              </button>
              <SubmitButton
                label={editingId ? "Save Item" : "Add Item"}
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
