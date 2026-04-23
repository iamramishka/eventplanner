import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  getVendorPortfolioBucketName,
  loadVendorGallery,
  removeVendorPortfolioAsset,
} from "@/lib/supabase/vendor-helpers";

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

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const { data: row, error: rowError } = await context.supabase
    .from("vendor_gallery_assets")
    .select("*")
    .eq("id", id)
    .eq("vendor_id", context.user.id)
    .maybeSingle();

  if (rowError || !row) {
    return NextResponse.json(
      { message: rowError?.message ?? "Gallery asset not found." },
      { status: 404 },
    );
  }

  try {
    await removeVendorPortfolioAsset(storageClient, String(row.image_path ?? ""));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to remove portfolio file." },
      { status: 400 },
    );
  }

  const { error } = await context.supabase
    .from("vendor_gallery_assets")
    .delete()
    .eq("id", id)
    .eq("vendor_id", context.user.id);

  if (error) {
    try {
      await storageClient.storage
        .from(getVendorPortfolioBucketName())
        .remove([String(row.image_path ?? "")]);
    } catch {}

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const { data: remainingRows, error: remainingError } = await context.supabase
    .from("vendor_gallery_assets")
    .select("id, sort_order")
    .eq("vendor_id", context.user.id)
    .order("sort_order", { ascending: true });

  if (remainingError) {
    return NextResponse.json({ message: remainingError.message }, { status: 400 });
  }

  for (const [index, item] of (remainingRows ?? []).entries()) {
    const { error: reorderError } = await context.supabase
      .from("vendor_gallery_assets")
      .update({ sort_order: index, is_featured: index === 0 })
      .eq("id", String(item.id))
      .eq("vendor_id", context.user.id);

    if (reorderError) {
      return NextResponse.json({ message: reorderError.message }, { status: 400 });
    }
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  const gallery = await loadVendorGallery(context.supabase, storageClient, context.user.id);
  return NextResponse.json({ gallery });
}
