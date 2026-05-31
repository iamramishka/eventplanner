import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  getWeddingForCurrentUser,
  mapRsvpHistoryRow,
} from "@/lib/supabase/guest-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const { guestId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const wedding = await getWeddingForCurrentUser(supabase, user.id);
  const { data, error } = await supabase
    .from("rsvp_responses")
    .select("*")
    .eq("guest_id", guestId)
    .order("submitted_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    history: (data ?? []).map((row) => mapRsvpHistoryRow(row, String(wedding.slug))),
  });
}
