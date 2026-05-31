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
  const { data: current, error: currentError } = await context.supabase
    .from("support_inquiries")
    .select("id, subject")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return NextResponse.json(
      { message: currentError?.message ?? "Unable to load support inquiry." },
      { status: 400 },
    );
  }

  const { error } = await context.supabase
    .from("support_inquiries")
    .update({ status: "resolved" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Resolved support inquiry",
    targetType: "support",
    targetId: String(current.id),
    reason: payload.reason,
    targetLabel: String(current.subject ?? "Support inquiry"),
  });

  return NextResponse.json({ ok: true });
}
