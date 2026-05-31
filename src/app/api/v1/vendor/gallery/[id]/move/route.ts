import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  loadVendorGallery,
} from "@/lib/supabase/vendor-helpers";

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

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const payload = (await request.json()) as { direction: "up" | "down" };
  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const { data: items, error } = await context.supabase
    .from("vendor_gallery_assets")
    .select("id, sort_order")
    .eq("vendor_id", context.user.id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const orderedItems = (items ?? []).map((item) => ({
    id: String(item.id),
    sortOrder: Number(item.sort_order ?? 0),
  }));
  const index = orderedItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return NextResponse.json({ message: "Gallery asset not found." }, { status: 404 });
  }

  const targetIndex = payload.direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= orderedItems.length) {
    return NextResponse.json({
      gallery: await loadVendorGallery(context.supabase, storageClient, context.user.id),
    });
  }

  const [selected] = orderedItems.splice(index, 1);
  orderedItems.splice(targetIndex, 0, selected);

  for (const [nextIndex, item] of orderedItems.entries()) {
    const { error: updateError } = await context.supabase
      .from("vendor_gallery_assets")
      .update({ sort_order: nextIndex })
      .eq("id", item.id)
      .eq("vendor_id", context.user.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  const gallery = await loadVendorGallery(context.supabase, storageClient, context.user.id);
  return NextResponse.json({ gallery });
}
