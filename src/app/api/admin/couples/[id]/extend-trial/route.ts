import { NextResponse } from "next/server";
import { appendAdminAuditLog } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getAdminRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const payload = (await request.json()) as { extraDays?: number; reason: string };
  const extraDays = Number(payload.extraDays ?? 3);

  const { data: wedding, error: weddingError } = await context.supabase
    .from("weddings")
    .select("id, owner_user_id")
    .eq("owner_user_id", id)
    .maybeSingle();

  if (weddingError || !wedding) {
    return NextResponse.json(
      { message: weddingError?.message ?? "Unable to find the couple wedding." },
      { status: 400 },
    );
  }

  const { data: subscription, error: subscriptionError } = await context.supabase
    .from("wedding_subscriptions")
    .select("id, trial_ends_at, grace_ends_at")
    .eq("wedding_id", wedding.id)
    .maybeSingle();

  if (subscriptionError || !subscription) {
    return NextResponse.json(
      { message: subscriptionError?.message ?? "Unable to find the wedding subscription." },
      { status: 400 },
    );
  }

  const nextTrialEndsAt = new Date(subscription.trial_ends_at ?? Date.now());
  nextTrialEndsAt.setDate(nextTrialEndsAt.getDate() + extraDays);
  const nextGraceEndsAt = new Date(subscription.grace_ends_at ?? nextTrialEndsAt.toISOString());
  nextGraceEndsAt.setDate(nextGraceEndsAt.getDate() + extraDays);

  const { error: updateError } = await context.supabase
    .from("wedding_subscriptions")
    .update({
      status: "trial",
      trial_ends_at: nextTrialEndsAt.toISOString(),
      grace_ends_at: nextGraceEndsAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  await context.supabase
    .from("profiles")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", id);

  const { data: profile } = await context.supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .maybeSingle();

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Extended trial",
    targetType: "couple",
    targetId: String(id),
    reason: payload.reason,
    targetLabel: String(profile?.full_name ?? "Couple"),
    extraPayload: { extraDays },
  });

  return NextResponse.json({ ok: true });
}
