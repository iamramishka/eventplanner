import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  getVendorVisibilityData,
  mapVendorVisibilityRow,
} from "@/lib/supabase/vendor-helpers";

const publicMessage = "Your profile is approved and currently visible to couples.";
const hiddenMessage =
  "Your profile is hidden from public discovery until you turn visibility back on.";

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
  const visibility = await getVendorVisibilityData(
    context.supabase,
    storageClient,
    context.vendorProfile,
  );

  return NextResponse.json({ visibility });
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

  const payload = (await request.json()) as { isPublic: boolean };
  const nextState = Boolean(payload.isPublic);
  const storageClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : context.supabase;
  const current = await getVendorVisibilityData(
    context.supabase,
    storageClient,
    context.vendorProfile,
  );

  if (nextState && current.status !== "approved") {
    return NextResponse.json(
      { message: "Your profile must be approved before it can go public." },
      { status: 400 },
    );
  }

  if (nextState && !current.canBePublic) {
    return NextResponse.json(
      { message: "Finish the required profile sections before going public." },
      { status: 400 },
    );
  }

  const { data: updatedProfile, error } = await context.supabase
    .from("vendor_profiles")
    .update({
      is_public: nextState,
      can_be_public: current.canBePublic,
      admin_message: nextState ? publicMessage : hiddenMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !updatedProfile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor visibility." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    visibility: mapVendorVisibilityRow(
      updatedProfile as Record<string, unknown>,
      current.canBePublic,
    ),
  });
}
