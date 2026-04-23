import { NextResponse } from "next/server";
import { appendAdminAuditLog } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { PlanRecord } from "@/types/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function PATCH(
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
  const payload = (await request.json()) as { plan: PlanRecord; reason: string };

  const { data: plan, error } = await context.supabase
    .from("plans")
    .update({
      name: payload.plan.name.trim(),
      price_label: payload.plan.priceLabel.trim(),
      guest_limit: payload.plan.guestLimit,
      gallery_limit: payload.plan.galleryLimit,
      features: payload.plan.features,
      active: payload.plan.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, name")
    .maybeSingle();

  if (error || !plan) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update plan." },
      { status: 400 },
    );
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Updated plan",
    targetType: "plan",
    targetId: String(plan.id),
    reason: payload.reason,
    targetLabel: String(plan.name ?? "Plan"),
  });

  return NextResponse.json({ ok: true });
}
