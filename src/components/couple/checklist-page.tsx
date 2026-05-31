"use client";

import { useEffect, useState, useTransition } from "react";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { ChecklistItemRecord } from "@/types/couple";

type ChecklistFormState = Omit<ChecklistItemRecord, "id" | "weddingSlug"> & {
  dueDate: string;
};

const emptyChecklistForm: ChecklistFormState = {
  group: "1 month before",
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium" as const,
  isCompleted: false,
};

export function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItemRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyChecklistForm);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => setItems(await coupleService.getChecklistItems());

  useEffect(() => {
    load();
  }, []);

  const grouped = items.reduce<Record<string, ChecklistItemRecord[]>>((accumulator, item) => {
    accumulator[item.group] = accumulator[item.group] ?? [];
    accumulator[item.group].push(item);
    return accumulator;
  }, {});

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Checklist"
        title="Checklist / task list"
        description="Keep planning momentum with a guided checklist that feels motivating rather than overwhelming."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <CouplePanel className="p-6">
          {items.length ? (
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, groupItems]) => (
                <div key={group}>
                  <h2 className="text-lg font-semibold text-charcoal">{group}</h2>
                  <div className="mt-3 space-y-3">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold ${item.isCompleted ? "text-muted line-through" : "text-charcoal"}`}>
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-muted">{item.description || "No description"}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() =>
                              startTransition(async () => {
                                await coupleService.toggleChecklistItem(item.id);
                                await load();
                              })
                            }
                            className="rounded-full bg-[#F4F7F1] px-3 py-1.5 text-xs font-semibold text-[#4F8A5B]"
                          >
                            {item.isCompleted ? "Undo" : "Complete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setForm({
                                group: item.group,
                                title: item.title,
                                description: item.description,
                                dueDate: item.dueDate ?? "",
                                priority: item.priority,
                                isCompleted: item.isCompleted,
                              });
                            }}
                            className="rounded-full border border-[#E8DDD7] px-3 py-1.5 text-xs font-semibold text-charcoal"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CoupleEmptyState
              title="No checklist items yet"
              description="Start with a few important tasks to build momentum."
            />
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {editingId ? "Edit task" : "Add task"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                await coupleService.upsertChecklistItem({
                  id: editingId ?? undefined,
                  ...form,
                });
                await load();
                setNotice(editingId ? "Task updated." : "Task added.");
                setEditingId(null);
                setForm(emptyChecklistForm);
              });
            }}
          >
            <Field
              label="Timeline group"
              name="group"
              value={form.group}
              onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))}
            />
            <Field
              label="Task title"
              name="title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-charcoal">Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                className="couple-focus rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Due date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as "Low" | "Medium" | "High",
                    }))
                  }
                  className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                >
                  {["Low", "Medium", "High"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyChecklistForm);
                }}
                className="rounded-full border border-[#E8DDD7] px-4 py-3 text-sm font-semibold text-charcoal"
              >
                Clear
              </button>
              <SubmitButton
                label={editingId ? "Save Task" : "Add Task"}
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
