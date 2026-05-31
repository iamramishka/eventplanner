import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  ensureProfileForUser,
  ensureVendorProfileForUser,
} from "@/lib/supabase/auth-helpers";

export async function getVendorRouteContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: userError?.message ?? "Please sign in again." },
        { status: 401 },
      ),
    };
  }

  try {
    await ensureProfileForUser(supabase, user);
    await ensureVendorProfileForUser(supabase, user);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "Unable to load profile.");
    }

    if (profile.role !== "vendor") {
      return {
        ok: false as const,
        response: NextResponse.json(
          { message: "This account is not a vendor account." },
          { status: 403 },
        ),
      };
    }

    const { data: vendorProfile, error: vendorError } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (vendorError || !vendorProfile) {
      throw new Error(vendorError?.message ?? "Unable to load vendor profile.");
    }

    return {
      ok: true as const,
      supabase,
      user,
      profile,
      vendorProfile,
    };
  } catch (caughtError) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load vendor workspace.",
        },
        { status: 400 },
      ),
    };
  }
}
