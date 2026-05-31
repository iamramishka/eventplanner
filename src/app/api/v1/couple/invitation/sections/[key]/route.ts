import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import {
  getInvitationWorkspaceForWedding,
  getInvitationSeedBlocks,
} from "@/lib/supabase/couple-planning-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
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

  const { key } = await params;
  const payload = (await request.json()) as { title: string; body: string };
  const now = new Date().toISOString();

  const { data: block, error: blockError } = await context.supabase
    .from("invitation_content_blocks")
    .select("id, sort_order")
    .eq("wedding_id", String(context.wedding.id))
    .eq("block_key", key)
    .maybeSingle();

  if (blockError) {
    return NextResponse.json({ message: blockError.message }, { status: 400 });
  }

  if (block) {
    const { error } = await context.supabase
      .from("invitation_content_blocks")
      .update({
        title: payload.title.trim(),
        body: payload.body,
      })
      .eq("id", String(block.id));

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } else {
    const fallbackOrder =
      getInvitationSeedBlocks().findIndex((item) => item.block_key === key) >= 0
        ? getInvitationSeedBlocks().findIndex((item) => item.block_key === key)
        : getInvitationSeedBlocks().length;

    const { error } = await context.supabase.from("invitation_content_blocks").insert({
      id: randomUUID(),
      wedding_id: String(context.wedding.id),
      block_key: key,
      title: payload.title.trim(),
      body: payload.body,
      sort_order: fallbackOrder,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }

  const { error: siteError } = await context.supabase
    .from("invitation_sites")
    .update({
      has_unpublished_changes: true,
      last_draft_saved_at: now,
      updated_at: now,
    })
    .eq("wedding_id", String(context.wedding.id));

  if (siteError) {
    return NextResponse.json({ message: siteError.message }, { status: 400 });
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
