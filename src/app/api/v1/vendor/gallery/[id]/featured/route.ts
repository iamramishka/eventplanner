import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  loadVendorGallery,
} from "@/lib/supabase/vendor-helpers";

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
    .select("id")
    .eq("id", id)
    .eq("vendor_id", context.user.id)
    .maybeSingle();

  if (rowError || !row) {
    return NextResponse.json(
      { message: rowError?.message ?? "Gallery asset not found." },
      { status: 404 },
    );
  }

  const { error: resetError } = await context.supabase
    .from("vendor_gallery_assets")
    .update({ is_featured: false })
    .eq("vendor_id", context.user.id);

  if (resetError) {
    return NextResponse.json({ message: resetError.message }, { status: 400 });
  }

  const { error } = await context.supabase
    .from("vendor_gallery_assets")
    .update({ is_featured: true })
    .eq("id", id)
    .eq("vendor_id", context.user.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  const gallery = await loadVendorGallery(context.supabase, storageClient, context.user.id);
  return NextResponse.json({ gallery });
}
