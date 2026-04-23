import { NextResponse } from "next/server";
import { appendAdminAuditLog, computeVendorCanBePublic, mapVendorAdminStatus } from "@/lib/supabase/admin-helpers";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { VendorStatus } from "@/types/admin";
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
  const payload = (await request.json()) as { status: VendorStatus; reason: string };

  const { data: current, error: currentError } = await context.supabase
    .from("vendor_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  if (currentError || !current) {
    return NextResponse.json(
      { message: currentError?.message ?? "Unable to load vendor profile." },
      { status: 400 },
    );
  }

  let update: Record<string, unknown>;
  let action = "Updated vendor status";

  if (payload.status === "approved") {
    update = {
      status: "approved",
      approved_at: new Date().toISOString(),
      can_be_public: await computeVendorCanBePublic(context.supabase, context.supabase, current),
      admin_message: "Your vendor profile has been approved. You can make it public when ready.",
    };
    action = "Approved vendor";
  } else if (payload.status === "rejected") {
    update = {
      status: "rejected",
      is_public: false,
      can_be_public: false,
      admin_message: "Your vendor profile needs further updates before it can go live.",
    };
    action = "Rejected vendor";
  } else {
    update = {
      status: "blocked",
      is_public: false,
      can_be_public: false,
      admin_message: "Your vendor profile has been suspended by the platform team.",
    };
    action = "Suspended vendor";
  }

  const { data: vendor, error } = await context.supabase
    .from("vendor_profiles")
    .update(update)
    .eq("user_id", id)
    .select("user_id, business_name, status")
    .maybeSingle();

  if (error || !vendor) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor status." },
      { status: 400 },
    );
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action,
    targetType: "vendor",
    targetId: String(vendor.user_id),
    reason: payload.reason,
    targetLabel: String(vendor.business_name ?? "Vendor"),
    extraPayload: { status: mapVendorAdminStatus(vendor.status) },
  });

  return NextResponse.json({ ok: true });
}
