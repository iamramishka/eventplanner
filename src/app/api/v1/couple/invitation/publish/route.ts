import { NextResponse } from "next/server";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { getInvitationWorkspaceForWedding } from "@/lib/supabase/couple-planning-helpers";

export async function POST() {
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

  const { data: heroBlock, error: heroError } = await context.supabase
    .from("invitation_content_blocks")
    .select("body")
    .eq("wedding_id", String(context.wedding.id))
    .eq("block_key", "hero")
    .maybeSingle();

  if (heroError) {
    return NextResponse.json({ message: heroError.message }, { status: 400 });
  }

  if (!String(heroBlock?.body ?? "").trim()) {
    return NextResponse.json(
      { message: "Add your main invitation message before publishing." },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { error } = await context.supabase
    .from("invitation_sites")
    .update({
      is_published: true,
      has_unpublished_changes: false,
      last_draft_saved_at: now,
      last_published_at: now,
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
