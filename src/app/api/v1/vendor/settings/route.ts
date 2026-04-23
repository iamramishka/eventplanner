import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  mapVendorAccountSettings,
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
    settings: mapVendorAccountSettings(
      String(context.profile.full_name ?? ""),
      context.user.email ?? String(context.vendorProfile.email ?? ""),
      String(context.vendorProfile.business_name ?? ""),
    ),
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
    fullName: string;
    email: string;
    businessName: string;
  };

  const fullName = payload.fullName.trim();
  const email = payload.email.trim().toLowerCase();
  const businessName = payload.businessName.trim();

  if (!fullName) {
    return NextResponse.json({ message: "Full name is required." }, { status: 400 });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { message: "A valid email address is required." },
      { status: 400 },
    );
  }

  if (!businessName) {
    return NextResponse.json({ message: "Business name is required." }, { status: 400 });
  }

  const authUpdate: {
    email?: string;
    data: {
      full_name: string;
      business_name: string;
    };
  } = {
    data: {
      full_name: fullName,
      business_name: businessName,
    },
  };

  if (email !== (context.user.email ?? "").trim().toLowerCase()) {
    authUpdate.email = email;
  }

  const { error: authError } = await context.supabase.auth.updateUser(authUpdate);
  if (authError) {
    return NextResponse.json({ message: authError.message }, { status: 400 });
  }

  const { error: profileError } = await context.supabase
    .from("profiles")
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.user.id);

  if (profileError) {
    return NextResponse.json({ message: profileError.message }, { status: 400 });
  }

  const { data: updatedVendorProfile, error: vendorError } = await context.supabase
    .from("vendor_profiles")
    .update({
      business_name: businessName,
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (vendorError || !updatedVendorProfile) {
    return NextResponse.json(
      { message: vendorError?.message ?? "Unable to update vendor settings." },
      { status: 400 },
    );
  }

  const triggerRereview =
    businessName !== String(context.vendorProfile.business_name ?? "").trim() ||
    email !== String(context.vendorProfile.email ?? "").trim().toLowerCase();

  await applyVendorPostEditState(context.supabase, updatedVendorProfile, {
    triggerRereview,
  });

  return NextResponse.json({
    settings: mapVendorAccountSettings(fullName, email, businessName),
  });
}
