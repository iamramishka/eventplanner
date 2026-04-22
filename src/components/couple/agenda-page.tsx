"use client";

import { useEffect, useState, useTransition } from "react";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { AgendaItemRecord } from "@/types/couple";

const emptyAgendaForm = {
  title: "",
  eventTime: "",
  durationMinutes: 30,
  description: "",
  iconKey: "sparkles",
};

export function AgendaPage() {
  const [items, setItems] = useState<AgendaItemRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAgendaForm);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setItems(await coupleService.getAgenda());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Agenda"
        title="Agenda / timeline"
        description="Shape the guest-facing flow of the day with a simple, editable wedding timeline."
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
                      <p className="font-semibold text-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.eventTime} · {item.durationMinutes} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            title: item.title,
                            eventTime: item.eventTime,
                            durationMinutes: item.durationMinutes,
                            description: item.description,
                            iconKey: item.iconKey,
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
                            await coupleService.deleteAgenda(item.id);
                            await load();
                            setNotice("Agenda item removed.");
                          })
                        }
                        className="rounded-full border border-[#F2D2D2] px-3 py-1.5 text-xs font-semibold text-[#D95C5C]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <CoupleEmptyState
              title="No agenda yet"
              description="Create a few key moments so guests can understand the flow of the day."
            />
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {editingId ? "Edit agenda item" : "Add agenda item"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(async () => {
                await coupleService.upsertAgenda({
                  id: editingId ?? undefined,
                  ...form,
                });
                await load();
                setNotice(editingId ? "Agenda item updated." : "Agenda item added.");
                setEditingId(null);
                setForm(emptyAgendaForm);
              });
            }}
          >
            <Field
              label="Title"
              name="title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Time"
                name="eventTime"
                type="time"
                value={form.eventTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, eventTime: event.target.value }))
                }
              />
              <Field
                label="Duration (minutes)"
                name="durationMinutes"
                type="number"
                value={String(form.durationMinutes)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: Number(event.target.value || 0),
                  }))
                }
              />
            </div>
            <Field
              label="Icon label"
              name="iconKey"
              value={form.iconKey}
              onChange={(event) =>
                setForm((current) => ({ ...current, iconKey: event.target.value }))
              }
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
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyAgendaForm);
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
