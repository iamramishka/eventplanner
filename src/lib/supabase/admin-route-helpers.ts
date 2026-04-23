import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ensureProfileForUser } from "@/lib/supabase/auth-helpers";

export async function getAdminRouteContext() {
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name, status, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "Unable to load admin profile.");
    }

    if (profile.role !== "super_admin") {
      return {
        ok: false as const,
        response: NextResponse.json(
          { message: "This account is not a super admin account." },
          { status: 403 },
        ),
      };
    }

    return {
      ok: true as const,
      supabase,
      user,
      profile,
    };
  } catch (caughtError) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load the admin workspace.",
        },
        { status: 400 },
      ),
    };
  }
}
