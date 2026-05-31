import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { getInvitationWorkspaceForWedding } from "@/lib/supabase/couple-planning-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;
  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;

  const { data: row, error: rowError } = await context.supabase
    .from("gallery_assets")
    .select("id")
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (rowError || !row) {
    return NextResponse.json(
      { message: rowError?.message ?? "Gallery asset not found." },
      { status: 404 },
    );
  }

  const { error: resetError } = await context.supabase
    .from("gallery_assets")
    .update({ is_cover: false })
    .eq("wedding_id", String(context.wedding.id));

  if (resetError) {
    return NextResponse.json({ message: resetError.message }, { status: 400 });
  }

  const { error } = await context.supabase
    .from("gallery_assets")
    .update({ is_cover: true })
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const workspace = await getInvitationWorkspaceForWedding(
    storageClient,
    String(context.wedding.id),
    String(context.wedding.slug),
  );

  return NextResponse.json({ workspace });
}
