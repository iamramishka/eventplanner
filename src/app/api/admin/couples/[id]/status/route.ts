import { NextResponse } from "next/server";
import { CoupleStatus } from "@/types/admin";
import { appendAdminAuditLog } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const allowedStatuses = new Set<CoupleStatus>([
  "active",
  "trial",
  "expired",
  "suspended",
  "deleted",
]);

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
  const payload = (await request.json()) as { status: CoupleStatus; reason: string };

  if (!allowedStatuses.has(payload.status)) {
    return NextResponse.json({ message: "Unsupported couple status." }, { status: 400 });
  }

  const nextProfileStatus =
    payload.status === "deleted"
      ? "deleted"
      : payload.status === "suspended"
        ? "suspended"
        : "active";

  const { data: profile, error } = await context.supabase
    .from("profiles")
    .update({ status: nextProfileStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("role", "couple")
    .select("id, full_name")
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update couple status." },
      { status: 400 },
    );
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action:
      payload.status === "deleted"
        ? "Soft deleted couple"
        : payload.status === "suspended"
          ? "Suspended couple"
          : "Reactivated couple",
    targetType: "couple",
    targetId: String(profile.id),
    reason: payload.reason,
    targetLabel: String(profile.full_name ?? "Couple"),
    extraPayload: { status: payload.status },
  });

  return NextResponse.json({ ok: true });
}
