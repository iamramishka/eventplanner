import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { toWeddingSettings } from "@/lib/supabase/couple-helpers";
import { getInvitationIntroFallback } from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const settings = toWeddingSettings(context.wedding);
  settings.introMessage =
    String(context.wedding.intro_message ?? "").trim() || getInvitationIntroFallback();

  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const payload = (await request.json()) as {
    partnerOneName: string;
    partnerTwoName: string;
    weddingTitle: string;
    eventDate: string;
    dateTbd: boolean;
    venueName: string;
    venueTbd: boolean;
    venueMapLink: string;
    introMessage: string;
    timezone: string;
    contactPhone: string;
    rsvpDeadline: string;
    estimatedGuests: string;
    estimatedBudget: string;
  };

  const updatedRow = {
    partner_one_name: payload.partnerOneName.trim(),
    partner_two_name: payload.partnerTwoName.trim(),
    wedding_title:
      payload.weddingTitle.trim() ||
      `${payload.partnerOneName.trim()} & ${payload.partnerTwoName.trim()}`,
    event_date: payload.dateTbd || !payload.eventDate ? null : payload.eventDate,
    date_tbd: payload.dateTbd,
    venue_name: payload.venueTbd ? "" : payload.venueName.trim(),
    venue_tbd: payload.venueTbd,
    venue_map_link: payload.venueMapLink.trim(),
    intro_message: payload.introMessage.trim(),
    timezone: payload.timezone.trim() || "Asia/Colombo",
    contact_phone: payload.contactPhone.trim(),
    rsvp_deadline: payload.rsvpDeadline || null,
    estimated_guests: payload.estimatedGuests ? Number(payload.estimatedGuests) : null,
    estimated_budget: payload.estimatedBudget ? Number(payload.estimatedBudget) : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await context.supabase
    .from("weddings")
    .update(updatedRow)
    .eq("id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const nextWedding = {
    ...context.wedding,
    ...updatedRow,
  };
  const settings = toWeddingSettings(nextWedding);
  settings.introMessage =
    String(nextWedding.intro_message ?? "").trim() || getInvitationIntroFallback();

  return NextResponse.json({ settings });
}
