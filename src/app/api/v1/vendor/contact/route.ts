import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  mapVendorContactRow,
  validateVendorUrl,
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

  return NextResponse.json({
    contact: mapVendorContactRow(context.vendorProfile),
  });
}

export async function PATCH(request: Request) {
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
    phone: string;
    whatsapp: string;
    email: string;
    website: string;
    instagram: string;
    facebook: string;
    mapLink: string;
  };

  try {
    validateVendorUrl(payload.website, "Website");
    validateVendorUrl(payload.instagram, "Instagram");
    validateVendorUrl(payload.facebook, "Facebook");
    validateVendorUrl(payload.mapLink, "Map link");
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid contact URL." },
      { status: 400 },
    );
  }

  const { data: updatedProfile, error } = await context.supabase
    .from("vendor_profiles")
    .update({
      phone: payload.phone.trim(),
      whatsapp: payload.whatsapp.trim(),
      email: payload.email.trim().toLowerCase(),
      website: payload.website.trim(),
      instagram: payload.instagram.trim(),
      facebook: payload.facebook.trim(),
      map_link: payload.mapLink.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !updatedProfile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor contact information." },
      { status: 400 },
    );
  }

  const nextRow = await applyVendorPostEditState(context.supabase, updatedProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    contact: mapVendorContactRow(nextRow as Record<string, unknown>),
  });
}
