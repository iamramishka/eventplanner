import { NextResponse } from "next/server";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { getInvitationWorkspaceForWedding } from "@/lib/supabase/couple-planning-helpers";

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
    preset: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    surfaceColor: string;
  };
  const now = new Date().toISOString();

  const { error } = await context.supabase
    .from("invitation_sites")
    .update({
      theme_preset: payload.preset,
      primary_color: payload.primaryColor,
      secondary_color: payload.secondaryColor,
      accent_color: payload.accentColor,
      surface_color: payload.surfaceColor,
      has_unpublished_changes: true,
      last_draft_saved_at: now,
      updated_at: now,
    })
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const reader = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const workspace = await getInvitationWorkspaceForWedding(
    reader,
    String(context.wedding.id),
    String(context.wedding.slug),
  );
  return NextResponse.json({ workspace });
}
