import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";
import {
  getInvitationWorkspaceForWedding,
  getSubscriptionSnapshotForWedding,
  getWeddingGalleryBucketName,
  mapGalleryAssetRow,
  signWeddingGalleryRows,
  uploadWeddingGalleryAsset,
} from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
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

  const readClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;

  const { data, error } = await context.supabase
    .from("gallery_assets")
    .select("*")
    .eq("wedding_id", String(context.wedding.id))
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const rows = await signWeddingGalleryRows(
    readClient,
    (data ?? []) as Array<Record<string, unknown>>,
  );

  return NextResponse.json({
    gallery: rows.map((row) => mapGalleryAssetRow(row, String(context.wedding.slug))),
  });
}

export async function POST(request: Request) {
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
    name: string;
    imageType: "hero" | "story" | "gallery";
    imageUrl?: string;
    imageDataUrl?: string;
  };

  const imageDataUrl = payload.imageDataUrl ?? payload.imageUrl ?? "";
  if (!payload.name.trim() || !imageDataUrl) {
    return NextResponse.json(
      { message: "Image name and upload data are required." },
      { status: 400 },
    );
  }

  const throttled = await enforceRateLimit(request, {
    scope: "couple-gallery-upload",
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
  const subscription = await getSubscriptionSnapshotForWedding(
    context.supabase,
    String(context.wedding.id),
  );

  const { data: existingRows, error: existingError } = await context.supabase
    .from("gallery_assets")
    .select("id, sort_order")
    .eq("wedding_id", String(context.wedding.id))
    .order("sort_order", { ascending: true });

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  if ((existingRows ?? []).length >= subscription.imageLimit) {
    return NextResponse.json(
      { message: "Your current plan image limit has been reached." },
      { status: 400 },
    );
  }

  const assetId = randomUUID();
  let storagePath = "";

  try {
    storagePath = await uploadWeddingGalleryAsset(
      storageClient,
      String(context.wedding.id),
      assetId,
      payload.name,
      imageDataUrl,
    );
  } catch (error) {
    await captureServerError("couple-gallery-upload", error, {
      requestPath: "/api/v1/couple/gallery",
      role: "couple",
      actorId: context.user.id,
      weddingId: String(context.wedding.id),
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to upload image." },
      { status: 400 },
    );
  }

  const row = {
    id: assetId,
    wedding_id: String(context.wedding.id),
    name: payload.name.trim(),
    image_type: payload.imageType,
    image_path: storagePath,
    is_cover: (existingRows ?? []).length === 0,
    sort_order: (existingRows ?? []).length,
    created_at: new Date().toISOString(),
  };

  const { error } = await context.supabase.from("gallery_assets").insert(row);
  if (error) {
    await captureServerError("couple-gallery-upload", error, {
      requestPath: "/api/v1/couple/gallery",
      role: "couple",
      actorId: context.user.id,
      weddingId: String(context.wedding.id),
    });
    try {
      await storageClient.storage.from(getWeddingGalleryBucketName()).remove([storagePath]);
    } catch {}

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const workspace = await getInvitationWorkspaceForWedding(
    storageClient,
    String(context.wedding.id),
    String(context.wedding.slug),
  );

  return NextResponse.json({ workspace });
}
