"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { GuestRsvpCurrent, WeddingTableAssignmentRecord, WeddingTableRecord } from "@/types/couple";

export function TableAssignmentPage() {
  const [tables, setTables] = useState<WeddingTableRecord[]>([]);
  const [assignments, setAssignments] = useState<WeddingTableAssignmentRecord[]>([]);
  const [rsvps, setRsvps] = useState<GuestRsvpCurrent[]>([]);
  const [tableForm, setTableForm] = useState({ tableName: "", capacity: 8 });
  const [selectedTableId, setSelectedTableId] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    guestId: "",
    assignedCount: 1,
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const [{ tables: tableRows, assignments: assignmentRows }, rsvpRows] = await Promise.all([
      coupleService.getTables(),
      coupleService.getRsvps(),
    ]);
    setTables(tableRows);
    setAssignments(assignmentRows);
    setRsvps(rsvpRows);
    setSelectedTableId((current) => current || tableRows[0]?.id || "");
  };

  useEffect(() => {
    load();
  }, []);

  const selectedTable = tables.find((item) => item.id === selectedTableId) ?? null;
  const selectedAssignments = assignments.filter((item) => item.tableId === selectedTableId);
  const usedCapacity = selectedAssignments.reduce((total, item) => total + item.assignedCount, 0);
  const confirmedGuests = rsvps.filter((item) => item.status === "confirmed");
  const unassignedGuests = confirmedGuests.filter(
    (item) => !assignments.find((assignment) => assignment.guestId === item.guestId),
  );

  const tableRows = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        usedCapacity: assignments
          .filter((item) => item.tableId === table.id)
          .reduce((total, item) => total + item.assignedCount, 0),
      })),
    [assignments, tables],
  );

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Tables"
        title="Table assignment"
        description="Keep seating simple in the MVP: build tables, assign confirmed guests, and watch capacity before it breaks."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-6">
          <CouplePanel className="p-6">
            <h2 className="text-xl font-semibold text-charcoal">Create table</h2>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                startTransition(async () => {
                  await coupleService.upsertTable(tableForm);
                  await load();
                  setTableForm({ tableName: "", capacity: 8 });
                  setNotice("Table created.");
                });
              }}
            >
              <Field
                label="Table name"
                name="tableName"
                value={tableForm.tableName}
                onChange={(event) =>
                  setTableForm((current) => ({ ...current, tableName: event.target.value }))
                }
              />
              <Field
                label="Capacity"
                name="capacity"
                type="number"
                value={String(tableForm.capacity)}
                onChange={(event) =>
                  setTableForm((current) => ({
                    ...current,
                    capacity: Number(event.target.value || 0),
                  }))
                }
              />
              <div className="flex justify-end">
                <SubmitButton label="Add Table" pendingLabel="Saving..." pending={isPending} />
              </div>
            </form>
          </CouplePanel>

          <CouplePanel className="p-6">
            <h2 className="text-xl font-semibold text-charcoal">Current tables</h2>
            <div className="mt-5 space-y-3">
              {tableRows.length ? (
                tableRows.map((table) => (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className={`flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-4 text-left ${
                      selectedTableId === table.id
                        ? "border-[#C45A74] bg-[#FDF1F5]"
                        : "border-[#E8DDD7] bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-charcoal">{table.tableName}</p>
                      <p className="mt-1 text-sm text-muted">
                        {table.usedCapacity} / {table.capacity} seats used
                      </p>
                    </div>
                    <CoupleBadge
                      label={table.usedCapacity > table.capacity ? "Over" : "Ready"}
                      tone={table.usedCapacity > table.capacity ? "danger" : "success"}
                    />
                  </button>
                ))
              ) : (
                <CoupleEmptyState
                  title="No tables created"
                  description="Create your first table to begin assigning confirmed guests."
                />
              )}
            </div>
          </CouplePanel>
        </div>

        <CouplePanel className="p-6">
          {selectedTable ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-charcoal">{selectedTable.tableName}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {usedCapacity} of {selectedTable.capacity} seats assigned
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await coupleService.deleteTable(selectedTable.id);
                      await load();
                      setNotice("Table removed.");
                    })
                  }
                  className="rounded-full border border-[#F2D2D2] px-4 py-2.5 text-sm font-semibold text-[#D95C5C]"
                >
                  Delete Table
                </button>
              </div>

              <form
                className="grid gap-4 sm:grid-cols-[1fr_130px_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  setError("");
                  startTransition(async () => {
                    try {
                      const nextAssignments = await coupleService.assignGuestToTable({
                        tableId: selectedTable.id,
                        guestId: assignmentForm.guestId,
                        assignedCount: assignmentForm.assignedCount,
                      });
                      setAssignments(nextAssignments);
                      setNotice("Guest assigned to table.");
                    } catch (caughtError) {
                      setError(
                        caughtError instanceof Error
                          ? caughtError.message
                          : "Could not assign guest.",
                      );
                    }
                  });
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-charcoal">Confirmed guest</span>
                  <select
                    value={assignmentForm.guestId}
                    onChange={(event) =>
                      setAssignmentForm((current) => ({
                        ...current,
                        guestId: event.target.value,
                        assignedCount:
                          confirmedGuests.find((item) => item.guestId === event.target.value)
                            ?.attendingCount ?? 1,
                      }))
                    }
                    className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                  >
                    <option value="">Select a guest</option>
                    {unassignedGuests.map((guest) => (
                      <option key={guest.guestId} value={guest.guestId}>
                        {guest.guestName} · {guest.attendingCount} attending
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Count"
                  name="assignedCount"
                  type="number"
                  value={String(assignmentForm.assignedCount)}
                  onChange={(event) =>
                    setAssignmentForm((current) => ({
                      ...current,
                      assignedCount: Number(event.target.value || 0),
                    }))
                  }
                />
                <div className="self-end">
                  <SubmitButton
                    label="Assign"
                    pendingLabel="Assigning..."
                    pending={isPending}
                  />
                </div>
              </form>

              <div className="space-y-3">
                {selectedAssignments.length ? (
                  selectedAssignments.map((assignment) => {
                    const guest = confirmedGuests.find(
                      (item) => item.guestId === assignment.guestId,
                    );
                    return (
                      <div
                        key={assignment.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4"
                      >
                        <div>
                          <p className="font-semibold text-charcoal">{guest?.guestName}</p>
                          <p className="mt-1 text-sm text-muted">
                            {assignment.assignedCount} assigned · {guest?.side} side
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const next = await coupleService.removeTableAssignment(
                                assignment.guestId,
                              );
                              setAssignments(next);
                              setNotice("Assignment removed.");
                            })
                          }
                          className="rounded-full border border-[#E8DDD7] px-3 py-2 text-xs font-semibold text-charcoal"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <CoupleEmptyState
                    title="No one assigned yet"
                    description="Choose a confirmed guest and assign them to this table."
                  />
                )}
              </div>
            </div>
          ) : (
            <CoupleEmptyState
              title="Select a table"
              description="Choose a table to view assignments and available seats."
            />
          )}
        </CouplePanel>
      </div>
    </div>
  );
}
