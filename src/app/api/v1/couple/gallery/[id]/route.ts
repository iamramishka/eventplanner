import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import {
  getInvitationWorkspaceForWedding,
  removeWeddingGalleryAsset,
} from "@/lib/supabase/couple-planning-helpers";

export async function DELETE(
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
    .select("*")
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (rowError || !row) {
    return NextResponse.json(
      { message: rowError?.message ?? "Gallery asset not found." },
      { status: 404 },
    );
  }

  try {
    await removeWeddingGalleryAsset(storageClient, String(row.image_path ?? ""));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to remove gallery file." },
      { status: 400 },
    );
  }

  const { error } = await context.supabase
    .from("gallery_assets")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const { data: remainingRows, error: remainingError } = await context.supabase
    .from("gallery_assets")
    .select("id, sort_order")
    .eq("wedding_id", String(context.wedding.id))
    .order("sort_order", { ascending: true });

  if (remainingError) {
    return NextResponse.json({ message: remainingError.message }, { status: 400 });
  }

  for (const [index, item] of (remainingRows ?? []).entries()) {
    await context.supabase
      .from("gallery_assets")
      .update({ sort_order: index, is_cover: index === 0 })
      .eq("id", String(item.id))
      .eq("wedding_id", String(context.wedding.id));
  }

  const workspace = await getInvitationWorkspaceForWedding(
    storageClient,
    String(context.wedding.id),
    String(context.wedding.slug),
  );

  return NextResponse.json({ workspace });
}
