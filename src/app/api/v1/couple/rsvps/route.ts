import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  buildCurrentRsvp,
  getWeddingForCurrentUser,
  loadGuestsForWedding,
} from "@/lib/supabase/guest-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const wedding = await getWeddingForCurrentUser(supabase, user.id);
  const guests = await loadGuestsForWedding(supabase, String(wedding.id), String(wedding.slug));

  const guestIds = guests.map((guest: (typeof guests)[number]) => guest.id);
  if (!guestIds.length) {
    return NextResponse.json({ rsvps: [] });
  }

  const { data: latestRows, error } = await supabase
    .from("guest_rsvp_current_v")
    .select("*")
    .in("guest_id", guestIds);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const latestMap = new Map<string, Record<string, unknown>>(
    ((latestRows ?? []) as Array<Record<string, unknown>>).map(
      (row: Record<string, unknown>) => [String(row.guest_id), row],
    ),
  );

  const rsvps = guests.map((guest: (typeof guests)[number]) =>
    buildCurrentRsvp(guest, latestMap.get(guest.id) ?? null),
  );
  return NextResponse.json({ rsvps });
}
