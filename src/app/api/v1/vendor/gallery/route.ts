import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";
import {
  applyVendorPostEditState,
  getVendorPortfolioBucketName,
  loadVendorGallery,
  uploadVendorPortfolioAsset,
} from "@/lib/supabase/vendor-helpers";

export async function GET() {
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

  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const gallery = await loadVendorGallery(context.supabase, storageClient, context.user.id);

  return NextResponse.json({ gallery });
}

export async function POST(request: Request) {
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

  const payload = (await request.json()) as {
    imageUrl?: string;
    imageDataUrl?: string;
    altText?: string;
  };

  const imageDataUrl = payload.imageDataUrl ?? payload.imageUrl ?? "";
  if (!imageDataUrl.trim()) {
    return NextResponse.json({ message: "Image upload is required." }, { status: 400 });
  }

  const throttled = await enforceRateLimit(request, {
    scope: "vendor-gallery-upload",
    key: buildRateLimitKey([context.user.id]),
    max: getRateLimitConfig().upload.max,
    windowMs: getRateLimitConfig().upload.windowMs,
    message: "Too many uploads right now. Please wait before uploading again.",
  });

  if (throttled) {
    return throttled;
  }

  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const { data: existingRows, error: existingError } = await context.supabase
    .from("vendor_gallery_assets")
    .select("id")
    .eq("vendor_id", context.user.id)
    .order("sort_order", { ascending: true });

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  const assetId = randomUUID();
  let storagePath = "";

  try {
    storagePath = await uploadVendorPortfolioAsset(
      storageClient,
      context.user.id,
      assetId,
      payload.altText?.trim() || "portfolio-image",
      imageDataUrl,
    );
  } catch (error) {
    await captureServerError("vendor-gallery-upload", error, {
      requestPath: "/api/v1/vendor/gallery",
      role: "vendor",
      actorId: context.user.id,
      vendorId: context.user.id,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to upload portfolio asset." },
      { status: 400 },
    );
  }

  const row = {
    id: assetId,
    vendor_id: context.user.id,
    image_path: storagePath,
    alt_text: payload.altText?.trim() || "Vendor portfolio image",
    is_featured: (existingRows ?? []).length === 0,
    sort_order: (existingRows ?? []).length,
    uploaded_at: new Date().toISOString(),
  };

  const { error } = await context.supabase.from("vendor_gallery_assets").insert(row);
  if (error) {
    await captureServerError("vendor-gallery-upload", error, {
      requestPath: "/api/v1/vendor/gallery",
      role: "vendor",
      actorId: context.user.id,
      vendorId: context.user.id,
    });
    try {
      await storageClient.storage.from(getVendorPortfolioBucketName()).remove([storagePath]);
    } catch {}

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  const gallery = await loadVendorGallery(context.supabase, storageClient, context.user.id);
  return NextResponse.json({ gallery });
}
