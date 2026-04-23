import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  ensureGuestInvite,
  getWeddingForCurrentUser,
  loadGuestsForWedding,
  mapGuestRow,
  normalizePhoneValue,
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
  return NextResponse.json({ guests });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const payload = (await request.json()) as {
    name: string;
    side: "Bride" | "Groom";
    whatsappCountryCode: string;
    whatsappNumber: string;
    email: string;
    invitationType: "Individual" | "Family";
    maxAllowedMembers: number;
    notes: string;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const wedding = await getWeddingForCurrentUser(supabase, user.id);
  const normalizedPhone = normalizePhoneValue(payload.whatsappNumber);

  if (!payload.name.trim()) {
    return NextResponse.json({ message: "Guest name is required." }, { status: 400 });
  }

  if (!normalizedPhone) {
    return NextResponse.json({ message: "A valid WhatsApp number is required." }, { status: 400 });
  }

  if (payload.maxAllowedMembers < 1) {
    return NextResponse.json(
      { message: "Max allowed members must be at least 1." },
      { status: 400 },
    );
  }

  const { data: existingGuest, error: duplicateError } = await supabase
    .from("guests")
    .select("id")
    .eq("wedding_id", String(wedding.id))
    .eq("whatsapp_number", normalizedPhone)
    .maybeSingle();

  if (duplicateError) {
    return NextResponse.json({ message: duplicateError.message }, { status: 400 });
  }

  if (existingGuest) {
    return NextResponse.json(
      { message: "This WhatsApp number already exists in your guest list." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const guestId = randomUUID();
  const guestRow = {
    id: guestId,
    wedding_id: String(wedding.id),
    name: payload.name.trim(),
    side: payload.side,
    whatsapp_country_code: payload.whatsappCountryCode.trim() || "+94",
    whatsapp_number: normalizedPhone,
    email: payload.email.trim().toLowerCase(),
    invitation_type: payload.invitationType,
    max_allowed_members: payload.maxAllowedMembers,
    notes: payload.notes.trim(),
    created_at: now,
    updated_at: now,
  };

  const { error: insertError } = await supabase.from("guests").insert(guestRow);

  if (insertError) {
    return NextResponse.json({ message: insertError.message }, { status: 400 });
  }

  const invite = await ensureGuestInvite(supabase, guestId);
  const guest = mapGuestRow(
    { ...guestRow, weddings: { slug: wedding.slug } },
    invite,
  );

  return NextResponse.json({ guest }, { status: 201 });
}
