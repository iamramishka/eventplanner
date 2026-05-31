import { randomBytes } from "crypto";
import type {
  GuestRecord,
  GuestRsvpCurrent,
  GuestRsvpHistoryRecord,
  GuestRsvpStatus,
  InvitationType,
  LiquorPreference,
  MealPreference,
} from "@/types/couple";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

export function normalizePhoneValue(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function createInviteToken() {
  return `INV-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function getWeddingForCurrentUser(supabase: unknown, userId: string) {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("weddings")
    .select("*")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load wedding: ${error.message}`);
  }

  if (!data) {
    throw new Error("No wedding workspace found for this account.");
  }

  return data;
}

export function mapGuestRow(row: Record<string, unknown>, invite?: Record<string, unknown> | null): GuestRecord {
  const weddingRelation =
    typeof row.weddings === "object" && row.weddings
      ? (row.weddings as Record<string, unknown>)
      : null;

  return {
    id: String(row.id),
    weddingSlug: String(weddingRelation?.slug ?? row.wedding_slug ?? ""),
    name: String(row.name ?? ""),
    side: String(row.side ?? "Bride") as GuestRecord["side"],
    whatsappCountryCode: String(row.whatsapp_country_code ?? "+94"),
    whatsappNumber: String(row.whatsapp_number ?? ""),
    email: String(row.email ?? ""),
    invitationType: String(row.invitation_type ?? "Individual") as InvitationType,
    maxAllowedMembers: Number(row.max_allowed_members ?? 1),
    notes: String(row.notes ?? ""),
    inviteToken: String(invite?.invite_token ?? row.invite_token ?? ""),
    lastInviteSentAt:
      typeof row.last_invite_sent_at === "string" ? row.last_invite_sent_at : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export function mapRsvpHistoryRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): GuestRsvpHistoryRecord {
  return {
    id: String(row.id),
    weddingSlug,
    guestId: String(row.guest_id),
    status: String(row.status ?? "pending") as GuestRsvpStatus,
    attendingCount: Number(row.attending_count ?? 0),
    mealPreference: String(row.meal_preference ?? "Standard") as MealPreference,
    liquorPreference: String(row.liquor_preference ?? "Undecided") as LiquorPreference,
    specialNote: String(row.special_note ?? ""),
    submittedAt: String(row.submitted_at ?? new Date().toISOString()),
    source: String(row.source ?? "guest") as GuestRsvpHistoryRecord["source"],
  };
}

export function buildCurrentRsvp(
  guest: GuestRecord,
  latest: Record<string, unknown> | null,
): GuestRsvpCurrent {
  return {
    guestId: guest.id,
    guestName: guest.name,
    side: guest.side,
    status: String(latest?.status ?? "pending") as GuestRsvpStatus,
    attendingCount: Number(latest?.attending_count ?? 0),
    mealPreference: String(latest?.meal_preference ?? "Standard") as MealPreference,
    liquorPreference: String(latest?.liquor_preference ?? "Undecided") as LiquorPreference,
    specialNote: String(latest?.special_note ?? ""),
    submittedAt:
      typeof latest?.submitted_at === "string" ? latest.submitted_at : undefined,
    maxAllowedMembers: guest.maxAllowedMembers,
    inviteSentAt: guest.lastInviteSentAt,
  };
}

export async function loadGuestsForWedding(supabase: unknown, weddingId: string, weddingSlug: string) {
  const queryClient = asQueryClient(supabase);
  const { data: guests, error } = await queryClient
    .from("guests")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load guests: ${error.message}`);
  }

  const guestRows = (guests ?? []) as Array<Record<string, unknown>>;
  const guestIds = guestRows.map((guest: Record<string, unknown>) => String(guest.id));
  if (!guestIds.length) {
    return [];
  }

  const { data: invites, error: inviteError } = await queryClient
    .from("guest_invites")
    .select("*")
    .eq("is_active", true)
    .in("guest_id", guestIds);

  if (inviteError) {
    throw new Error(`Unable to load invite tokens: ${inviteError.message}`);
  }

  const inviteMap = new Map<string, Record<string, unknown>>(
    ((invites ?? []) as Array<Record<string, unknown>>).map((invite: Record<string, unknown>) => [
      String(invite.guest_id),
      invite,
    ]),
  );

  return guestRows.map((guest: Record<string, unknown>) =>
    mapGuestRow({ ...guest, wedding_slug: weddingSlug }, inviteMap.get(String(guest.id))),
  );
}

export async function ensureGuestInvite(supabase: unknown, guestId: string, sentAt?: string | null) {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("guest_invites")
    .select("*")
    .eq("guest_id", guestId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to inspect guest invite: ${error.message}`);
  }

  if (data) {
    if (sentAt) {
      const { error: updateError } = await queryClient
        .from("guest_invites")
        .update({ sent_at: sentAt })
        .eq("guest_id", guestId);

      if (updateError) {
        throw new Error(`Unable to update invite metadata: ${updateError.message}`);
      }
      return { ...data, sent_at: sentAt };
    }
    return data;
  }

  const inviteToken = createInviteToken();
  const { data: createdData, error: insertError } = await queryClient.from("guest_invites").insert({
    guest_id: guestId,
    invite_token: inviteToken,
    is_active: true,
    sent_at: sentAt ?? null,
  });

  if (insertError) {
    throw new Error(`Unable to create guest invite: ${insertError.message}`);
  }

  if (Array.isArray(createdData)) {
    return createdData[0];
  }

  return (createdData as Record<string, unknown> | null) ?? {
    guest_id: guestId,
    invite_token: inviteToken,
    sent_at: sentAt ?? null,
  };
}
