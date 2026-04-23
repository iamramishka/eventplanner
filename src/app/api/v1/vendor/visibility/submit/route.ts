import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  buildPendingReviewState,
  getVendorVisibilityData,
  mapVendorVisibilityRow,
} from "@/lib/supabase/vendor-helpers";

export async function POST() {
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
  const current = await getVendorVisibilityData(
    context.supabase,
    storageClient,
    context.vendorProfile,
  );

  if (current.missingSteps.length) {
    return NextResponse.json(
      { message: "Complete the required profile sections before submitting." },
      { status: 400 },
    );
  }

  const { data: updatedProfile, error } = await context.supabase
    .from("vendor_profiles")
    .update({
      ...buildPendingReviewState(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !updatedProfile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to submit vendor profile for review." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    visibility: mapVendorVisibilityRow(updatedProfile as Record<string, unknown>, false),
  });
}
