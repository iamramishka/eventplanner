import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  ensureGuestInvite,
  getWeddingForCurrentUser,
  mapGuestRow,
  normalizePhoneValue,
} from "@/lib/supabase/guest-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const { guestId } = await params;
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

  const { data: duplicate, error: duplicateError } = await supabase
    .from("guests")
    .select("id")
    .eq("wedding_id", String(wedding.id))
    .eq("whatsapp_number", normalizedPhone)
    .maybeSingle();

  if (duplicateError) {
    return NextResponse.json({ message: duplicateError.message }, { status: 400 });
  }

  if (duplicate && String(duplicate.id) !== guestId) {
    return NextResponse.json(
      { message: "This WhatsApp number already exists in your guest list." },
      { status: 409 },
    );
  }

  const { error: updateError } = await supabase
    .from("guests")
    .update({
      name: payload.name.trim(),
      side: payload.side,
      whatsapp_country_code: payload.whatsappCountryCode.trim() || "+94",
      whatsapp_number: normalizedPhone,
      email: payload.email.trim().toLowerCase(),
      invitation_type: payload.invitationType,
      max_allowed_members: payload.maxAllowedMembers,
      notes: payload.notes.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  const { data: guestRow, error: rowError } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .maybeSingle();

  if (rowError || !guestRow) {
    return NextResponse.json({ message: rowError?.message ?? "Guest not found." }, { status: 404 });
  }

  const invite = await ensureGuestInvite(supabase, guestId);
  return NextResponse.json({
    guest: mapGuestRow({ ...guestRow, weddings: { slug: wedding.slug } }, invite),
  });
}

export async function DELETE(
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

  await getWeddingForCurrentUser(supabase, user.id);

  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
