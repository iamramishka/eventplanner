import { NextResponse } from "next/server";
import { appendAdminAuditLog } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
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

  const payload = (await request.json()) as { reason: string };
  const { data: expired, error } = await context.supabase
    .from("wedding_subscriptions")
    .select("id, wedding_id, weddings(owner_user_id)")
    .eq("status", "expired");

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const rows = (expired ?? []) as Array<Record<string, unknown>>;
  const subscriptionIds = rows.map((row) => String(row.id));
  const coupleIds = rows
    .map((row) => {
      const wedding =
        Array.isArray(row.weddings) && row.weddings.length
          ? (row.weddings[0] as Record<string, unknown>)
          : typeof row.weddings === "object" && row.weddings !== null
            ? (row.weddings as Record<string, unknown>)
            : null;

      return wedding?.owner_user_id;
    })
    .filter(Boolean)
    .map((value) => String(value));

  if (subscriptionIds.length) {
    const { error: subscriptionError } = await context.supabase
      .from("wedding_subscriptions")
      .update({ status: "suspended", updated_at: new Date().toISOString() })
      .in("id", subscriptionIds);

    if (subscriptionError) {
      return NextResponse.json({ message: subscriptionError.message }, { status: 400 });
    }
  }

  if (coupleIds.length) {
    const { error: profileError } = await context.supabase
      .from("profiles")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .in("id", coupleIds);

    if (profileError) {
      return NextResponse.json({ message: profileError.message }, { status: 400 });
    }
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Ran cleanup batch",
    targetType: "system",
    reason: payload.reason,
    targetLabel: "Expired trials",
    extraPayload: { affectedSubscriptions: subscriptionIds.length },
  });

  return NextResponse.json({ ok: true, cleanedCount: subscriptionIds.length });
}
