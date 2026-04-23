import { NextResponse } from "next/server";
import { appendAdminAuditLog } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";

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

  const throttled = await enforceRateLimit(request, {
    scope: "admin-mutation",
    key: buildRateLimitKey([context.user.id]),
    max: getRateLimitConfig().adminMutation.max,
    windowMs: getRateLimitConfig().adminMutation.windowMs,
    message: "Too many admin actions. Please wait before trying again.",
  });

  if (throttled) {
    return throttled;
  }

  const { id } = await params;
  const payload = (await request.json()) as { reason: string };

  const { data: profile, error } = await context.supabase
    .from("profiles")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("role", "couple")
    .select("id, full_name")
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to soft delete the couple." },
      { status: 400 },
    );
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Soft deleted couple",
    targetType: "couple",
    targetId: String(profile.id),
    reason: payload.reason,
    targetLabel: String(profile.full_name ?? "Couple"),
  });

  return NextResponse.json({ ok: true });
}
