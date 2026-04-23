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
  const payload = (await request.json()) as { reason: string };
  const { data: current, error: currentError } = await context.supabase
    .from("invitation_templates")
    .select("id, name, status")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return NextResponse.json(
      { message: currentError?.message ?? "Unable to load template." },
      { status: 400 },
    );
  }

  const nextStatus = current.status === "active" ? "inactive" : "active";
  const { error } = await context.supabase
    .from("invitation_templates")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  await appendAdminAuditLog(context.supabase, {
    actorUserId: context.user.id,
    action: "Updated template status",
    targetType: "template",
    targetId: String(current.id),
    reason: payload.reason,
    targetLabel: String(current.name ?? "Template"),
    extraPayload: { status: nextStatus },
  });

  return NextResponse.json({ ok: true });
}
