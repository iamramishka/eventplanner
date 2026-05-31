import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  getWeddingForCurrentUser,
  loadGuestsForWedding,
  mapRsvpHistoryRow,
} from "@/lib/supabase/guest-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const { guestId } = await params;
  const payload = (await request.json()) as {
    status: "pending" | "confirmed" | "declined";
    attendingCount: number;
    mealPreference: "Standard" | "Vegetarian" | "Vegan" | "Halal";
    liquorPreference: "Yes" | "No" | "Undecided";
    specialNote: string;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const wedding = await getWeddingForCurrentUser(supabase, user.id);
  const guests = await loadGuestsForWedding(supabase, String(wedding.id), String(wedding.slug));
  const guest = guests.find((item: (typeof guests)[number]) => item.id === guestId);

  if (!guest) {
    return NextResponse.json({ message: "Guest not found." }, { status: 404 });
  }

  if (payload.attendingCount > guest.maxAllowedMembers) {
    return NextResponse.json(
      { message: "Attending count cannot exceed the allowed guest count." },
      { status: 400 },
    );
  }

  const submittedAt = new Date().toISOString();
  const { data, error } = await supabase.from("rsvp_responses").insert({
    guest_id: guestId,
    status: payload.status,
    attending_count: payload.status === "declined" ? 0 : payload.attendingCount,
    meal_preference: payload.mealPreference,
    liquor_preference: payload.liquorPreference,
    special_note: payload.specialNote,
    source: "couple",
    submitted_at: submittedAt,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const inserted = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  return NextResponse.json({
    entry: mapRsvpHistoryRow(
      inserted ?? {
        id: crypto.randomUUID(),
        guest_id: guestId,
        submitted_at: submittedAt,
        ...payload,
        source: "couple",
      },
      String(wedding.slug),
    ),
  });
}
