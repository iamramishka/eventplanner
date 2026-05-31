import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  buildUniqueWeddingSlug,
  seedInvitationForWedding,
  toStoredWedding,
  toSubscriptionSnapshot,
  toWeddingSettings,
  toInvitationWorkspace,
} from "@/lib/supabase/couple-helpers";
import { buildAppSession } from "@/lib/supabase/auth-helpers";
import { DEFAULT_TRIAL_PLAN_CODE } from "@/lib/supabase/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const payload = (await request.json()) as {
    partnerOneName: string;
    partnerTwoName: string;
    venueName: string;
    venueTbd: boolean;
    eventDate: string;
    dateTbd: boolean;
    estimatedGuests: string;
    guestsTbd: boolean;
    estimatedBudget: string;
    budgetTbd: boolean;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const appSession = await buildAppSession(supabase, user);
  if (appSession.role !== "couple") {
    return NextResponse.json({ message: "Only couples can create weddings." }, { status: 403 });
  }

  const weddingSlug = await buildUniqueWeddingSlug(
    supabase,
    `${payload.partnerOneName}-${payload.partnerTwoName}`,
  );

  const weddingId = randomUUID();
  const now = new Date().toISOString();
  const weddingRow = {
    id: weddingId,
    owner_user_id: user.id,
    slug: weddingSlug,
    partner_one_name: payload.partnerOneName.trim(),
    partner_two_name: payload.partnerTwoName.trim(),
    wedding_title: `${payload.partnerOneName.trim()} & ${payload.partnerTwoName.trim()}`,
    event_date: payload.dateTbd || !payload.eventDate ? null : payload.eventDate,
    date_tbd: payload.dateTbd,
    venue_name: payload.venueTbd ? "" : payload.venueName.trim(),
    venue_tbd: payload.venueTbd,
    venue_map_link: "",
    timezone: "Asia/Colombo",
    contact_phone: "",
    rsvp_deadline: null,
    estimated_guests:
      payload.guestsTbd || !payload.estimatedGuests ? null : Number(payload.estimatedGuests),
    estimated_budget:
      payload.budgetTbd || !payload.estimatedBudget ? null : Number(payload.estimatedBudget),
    setup_completed_at: now,
    created_at: now,
    updated_at: now,
  };

  const { error: weddingError } = await supabase.from("weddings").insert(weddingRow);
  if (weddingError) {
    return NextResponse.json({ message: weddingError.message }, { status: 400 });
  }

  const { data: trialPlan, error: planError } = await supabase
    .from("plans")
    .select("id")
    .eq("code", DEFAULT_TRIAL_PLAN_CODE)
    .maybeSingle();

  if (planError) {
    return NextResponse.json({ message: planError.message }, { status: 400 });
  }

  if (trialPlan?.id) {
    const { error: subscriptionError } = await supabase.from("wedding_subscriptions").insert({
      id: randomUUID(),
      wedding_id: weddingId,
      plan_id: trialPlan.id,
      status: "trial",
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      grace_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: now,
      updated_at: now,
    });

    if (subscriptionError) {
      return NextResponse.json({ message: subscriptionError.message }, { status: 400 });
    }
  }

  await seedInvitationForWedding(supabase, weddingId);

  const { data: invitationSite, error: invitationError } = await supabase
    .from("invitation_sites")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (invitationError) {
    return NextResponse.json({ message: invitationError.message }, { status: 400 });
  }

  const { data: blocks, error: blocksError } = await supabase
    .from("invitation_content_blocks")
    .select("*")
    .eq("wedding_id", weddingId);

  if (blocksError) {
    return NextResponse.json({ message: blocksError.message }, { status: 400 });
  }

  const { data: subscriptionRow } = await supabase
    .from("wedding_subscriptions")
    .select("status, plans(name, gallery_limit, features)")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  const session = await buildAppSession(supabase, user);

  return NextResponse.json({
    state: {
      status: "completed",
      weddingSlug,
    },
    bootstrap: {
      wedding: toStoredWedding(weddingRow),
      settings: toWeddingSettings(weddingRow),
      subscription: toSubscriptionSnapshot(subscriptionRow),
      invitation: toInvitationWorkspace(invitationSite, blocks ?? []),
    },
    session,
  });
}
