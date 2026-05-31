"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { getRsvpTone } from "@/lib/couple-utils";
import { GuestRecord, GuestRsvpCurrent, GuestSide, InvitationType } from "@/types/couple";

type GuestFormState = Omit<
  GuestRecord,
  "id" | "weddingSlug" | "inviteToken" | "createdAt" | "updatedAt"
>;

const emptyGuestForm: GuestFormState = {
  name: "",
  side: "Bride" as const,
  whatsappCountryCode: "+94",
  whatsappNumber: "",
  email: "",
  invitationType: "Individual" as const,
  maxAllowedMembers: 1,
  notes: "",
};

export function GuestManagementPage() {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [rsvps, setRsvps] = useState<GuestRsvpCurrent[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sideFilter, setSideFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyGuestForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  const load = async () => {
    const [guestRows, rsvpRows] = await Promise.all([
      coupleService.getGuests(),
      coupleService.getRsvps(),
    ]);
    setGuests(guestRows);
    setRsvps(rsvpRows);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredGuests = useMemo(
    () =>
      guests.filter((guest) => {
        const rsvp = rsvps.find((item) => item.guestId === guest.id);
        const matchesSearch =
          !deferredSearch ||
          guest.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
          guest.whatsappNumber.includes(deferredSearch) ||
          guest.email.toLowerCase().includes(deferredSearch.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || (rsvp?.status ?? "pending") === statusFilter;
        const matchesSide = sideFilter === "all" || guest.side === sideFilter;
        return matchesSearch && matchesStatus && matchesSide;
      }),
    [deferredSearch, guests, rsvps, sideFilter, statusFilter],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyGuestForm);
  };

  const beginEdit = (guest: GuestRecord) => {
    setEditingId(guest.id);
    setForm({
      name: guest.name,
      side: guest.side,
      whatsappCountryCode: guest.whatsappCountryCode,
      whatsappNumber: guest.whatsappNumber,
      email: guest.email,
      invitationType: guest.invitationType,
      maxAllowedMembers: guest.maxAllowedMembers,
      notes: guest.notes,
    });
  };

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Guests"
        title="Guest management"
        description="Build your guest list, control invitation rules, and send personalized invite links without relying on spreadsheets."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <CouplePanel className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
          <Field
            label="Search guests"
            name="search"
            value={search}
            placeholder="Name, WhatsApp, or email"
            onChange={(event) => setSearch(event.target.value)}
          />
          <label className="grid gap-2">
            <span className="text-sm font-medium text-charcoal">Side</span>
            <select
              value={sideFilter}
              onChange={(event) => setSideFilter(event.target.value)}
              className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
            >
              {["all", "Bride", "Groom"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-charcoal">RSVP status</span>
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <CouplePanel className="overflow-hidden">
          {filteredGuests.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#EEE3DD] text-left text-sm">
                <thead className="bg-[#FCF8F6] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Side</th>
                    <th className="px-4 py-3 font-medium">Invite</th>
                    <th className="px-4 py-3 font-medium">RSVP</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E6E0] bg-white">
                  {filteredGuests.map((guest) => {
                    const rsvp = rsvps.find((item) => item.guestId === guest.id);
                    return (
                      <tr key={guest.id} className="transition-soft hover:bg-[#FFF9F7]">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-charcoal">{guest.name}</p>
                          <p className="text-muted">{guest.whatsappCountryCode} {guest.whatsappNumber}</p>
                        </td>
                        <td className="px-4 py-4 text-muted">{guest.side}</td>
                        <td className="px-4 py-4 text-muted">
                          {guest.invitationType} · {guest.maxAllowedMembers}
                        </td>
                        <td className="px-4 py-4">
                          <CoupleBadge
                            label={rsvp?.status ?? "pending"}
                            tone={getRsvpTone(rsvp?.status ?? "pending")}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => beginEdit(guest)}
                              className="rounded-full border border-[#E8DDD7] px-3 py-1.5 text-xs font-semibold text-charcoal"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  await coupleService.sendInvite(guest.id);
                                  await load();
                                  setNotice(`Invite refreshed for ${guest.name}.`);
                                })
                              }
                              className="rounded-full bg-[#F8E7EC] px-3 py-1.5 text-xs font-semibold text-rose"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const link = await coupleService.getInviteLink(guest.id);
                                await navigator.clipboard.writeText(link);
                                setNotice(`Invite link copied for ${guest.name}.`);
                              }}
                              className="rounded-full bg-[#F4F7F1] px-3 py-1.5 text-xs font-semibold text-[#4F8A5B]"
                            >
                              Copy Link
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <CoupleEmptyState
                title="No guests yet"
                description="Add your first guest to start sending invitations and collecting RSVPs."
              />
            </div>
          )}
        </CouplePanel>

        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">
            {editingId ? "Edit guest" : "Add guest"}
          </h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              startTransition(async () => {
                try {
                  await coupleService.upsertGuest({
                    id: editingId ?? undefined,
                    ...form,
                  });
                  await load();
                  setNotice(editingId ? "Guest updated." : "Guest added.");
                  resetForm();
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error
                      ? caughtError.message
                      : "Could not save guest.",
                  );
                }
              });
            }}
          >
            <Field
              label="Guest name"
              name="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Side</span>
                <select
                  value={form.side}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      side: event.target.value as GuestSide,
                    }))
                  }
                  className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                >
                  <option value="Bride">Bride</option>
                  <option value="Groom">Groom</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Invitation type</span>
                <select
                  value={form.invitationType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      invitationType: event.target.value as InvitationType,
                    }))
                  }
                  className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                >
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-[110px_1fr]">
              <Field
                label="Code"
                name="whatsappCountryCode"
                value={form.whatsappCountryCode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    whatsappCountryCode: event.target.value,
                  }))
                }
              />
              <Field
                label="WhatsApp number"
                name="whatsappNumber"
                value={form.whatsappNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, whatsappNumber: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Email (optional)"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
              <Field
                label="Max allowed members"
                name="maxAllowedMembers"
                type="number"
                value={String(form.maxAllowedMembers)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    maxAllowedMembers: Number(event.target.value || 1),
                  }))
                }
              />
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-charcoal">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                className="couple-focus rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
              />
            </label>
            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[#E8DDD7] px-4 py-3 text-sm font-semibold text-charcoal"
              >
                Clear
              </button>
              <div className="flex gap-3">
                {editingId ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await coupleService.deleteGuest(editingId);
                        await load();
                        resetForm();
                        setNotice("Guest removed.");
                      })
                    }
                    className="rounded-full border border-[#E9C7C7] px-4 py-3 text-sm font-semibold text-[#D95C5C] disabled:opacity-70"
                  >
                    Delete
                  </button>
                ) : null}
                <SubmitButton
                  label={editingId ? "Save Guest" : "Add Guest"}
                  pendingLabel="Saving..."
                  pending={isPending}
                />
              </div>
            </div>
          </form>
        </CouplePanel>
      </div>
    </div>
  );
}
