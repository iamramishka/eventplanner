"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { formatCoupleDate, getRsvpTone } from "@/lib/couple-utils";
import { coupleService } from "@/lib/services/couple-service";
import {
  GuestRsvpCurrent,
  GuestRsvpHistoryRecord,
  GuestRsvpStatus,
  LiquorPreference,
  MealPreference,
} from "@/types/couple";

export function RsvpManagementPage() {
  const [rows, setRows] = useState<GuestRsvpCurrent[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [history, setHistory] = useState<GuestRsvpHistoryRecord[]>([]);
  const [notice, setNotice] = useState("");
  const [manualState, setManualState] = useState({
    status: "confirmed" as GuestRsvpStatus,
    attendingCount: 1,
    mealPreference: "Standard" as MealPreference,
    liquorPreference: "Undecided" as LiquorPreference,
    specialNote: "",
  });
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const load = async (guestId?: string) => {
    const rsvpRows = await coupleService.getRsvps();
    setRows(rsvpRows);
    const targetId = guestId ?? rsvpRows[0]?.guestId ?? "";
    setSelectedGuestId(targetId);
    if (targetId) {
      const historyRows = await coupleService.getRsvpHistory(targetId);
      setHistory(historyRows);
      const latest = rsvpRows.find((item) => item.guestId === targetId);
      if (latest) {
        setManualState({
          status: latest.status,
          attendingCount: latest.attendingCount || 1,
          mealPreference: latest.mealPreference,
          liquorPreference: latest.liquorPreference,
          specialNote: latest.specialNote,
        });
      }
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((item) => {
        const matchesSearch =
          !deferredSearch ||
          item.guestName.toLowerCase().includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [deferredSearch, rows, statusFilter],
  );

  const selected = rows.find((item) => item.guestId === selectedGuestId) ?? null;

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="RSVPs"
        title="Live RSVP tracking"
        description="Monitor the latest response state for every guest while keeping a history of changes for planning decisions."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Confirmed", value: rows.filter((item) => item.status === "confirmed").length },
          { label: "Pending", value: rows.filter((item) => item.status === "pending").length },
          { label: "Declined", value: rows.filter((item) => item.status === "declined").length },
          {
            label: "Headcount",
            value: rows
              .filter((item) => item.status === "confirmed")
              .reduce((total, item) => total + item.attendingCount, 0),
          },
        ].map((card) => (
          <CouplePanel key={card.label} className="p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-charcoal">{card.value}</p>
          </CouplePanel>
        ))}
      </div>

      <CouplePanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <Field
            label="Search RSVP"
            name="search"
            value={search}
            placeholder="Search guest name"
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-charcoal">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
            >
              {["all", "pending", "confirmed", "declined"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </CouplePanel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CouplePanel className="overflow-hidden">
          {filteredRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#EEE3DD] text-left text-sm">
                <thead className="bg-[#FCF8F6] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Attending</th>
                    <th className="px-4 py-3 font-medium">Preferences</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6E0] bg-white">
                  {filteredRows.map((item) => (
                    <tr
                      key={item.guestId}
                      onClick={() => load(item.guestId)}
                      className={`cursor-pointer transition-soft hover:bg-[#FFF9F7] ${
                        selectedGuestId === item.guestId ? "bg-[#FFF9F7]" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-charcoal">{item.guestName}</p>
                        <p className="text-muted">{item.side} side</p>
                      </td>
                      <td className="px-4 py-4">
                        <CoupleBadge label={item.status} tone={getRsvpTone(item.status)} />
                      </td>
                      <td className="px-4 py-4 text-muted">{item.attendingCount}</td>
                      <td className="px-4 py-4 text-muted">
                        {item.mealPreference} · {item.liquorPreference}
                      </td>
                      <td className="px-4 py-4 text-muted">{formatCoupleDate(item.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <CoupleEmptyState
                title="No RSVP data yet"
                description="Responses will appear here as soon as guests begin replying."
              />
            </div>
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          {selected ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-charcoal">{selected.guestName}</h2>
                <p className="mt-1 text-sm text-muted">
                  Latest response: {selected.status} · {selected.attendingCount} attending
                </p>
              </div>

              <form
                className="grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  startTransition(async () => {
                    await coupleService.updateRsvpManual(selected.guestId, manualState);
                    await load(selected.guestId);
                    setNotice(`RSVP updated for ${selected.guestName}.`);
                  });
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-charcoal">Status</span>
                    <select
                      value={manualState.status}
                      onChange={(event) =>
                        setManualState((current) => ({
                          ...current,
                          status: event.target.value as GuestRsvpStatus,
                        }))
                      }
                      className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="declined">declined</option>
                    </select>
                  </label>
                  <Field
                    label="Attending count"
                    name="attendingCount"
                    type="number"
                    value={String(manualState.attendingCount)}
                    onChange={(event) =>
                      setManualState((current) => ({
                        ...current,
                        attendingCount: Number(event.target.value || 0),
                      }))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-charcoal">Meal preference</span>
                    <select
                      value={manualState.mealPreference}
                      onChange={(event) =>
                        setManualState((current) => ({
                          ...current,
                          mealPreference: event.target.value as MealPreference,
                        }))
                      }
                      className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                    >
                      {["Standard", "Vegetarian", "Vegan", "Halal"].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-charcoal">Liquor preference</span>
                    <select
                      value={manualState.liquorPreference}
                      onChange={(event) =>
                        setManualState((current) => ({
                          ...current,
                          liquorPreference: event.target.value as LiquorPreference,
                        }))
                      }
                      className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                    >
                      {["Yes", "No", "Undecided"].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-charcoal">Special note</span>
                  <textarea
                    value={manualState.specialNote}
                    onChange={(event) =>
                      setManualState((current) => ({
                        ...current,
                        specialNote: event.target.value,
                      }))
                    }
                    rows={4}
                    className="couple-focus rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
                  />
                </label>
                <div className="flex justify-end">
                  <SubmitButton
                    label="Save Manual Update"
                    pendingLabel="Saving..."
                    pending={isPending}
                  />
                </div>
              </form>

              <div>
                <h3 className="text-base font-semibold text-charcoal">Response history</h3>
                <div className="mt-3 space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="rounded-[1.4rem] border border-[#E8DDD7] px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <CoupleBadge label={item.status} tone={getRsvpTone(item.status)} />
                        <p className="text-sm text-muted">
                          {item.attendingCount} attending · {item.source}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        {item.mealPreference} · {item.liquorPreference}
                      </p>
                      <p className="mt-2 text-sm text-charcoal">{item.specialNote || "No special note."}</p>
                      <p className="mt-2 text-xs text-muted">{formatCoupleDate(item.submittedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <CoupleEmptyState
              title="Select a guest"
              description="Choose an RSVP row to inspect response history or apply a manual adjustment."
            />
          )}
        </CouplePanel>
      </div>
    </div>
  );
}
