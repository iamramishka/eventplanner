import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getWeddingForCurrentUser } from "@/lib/supabase/guest-helpers";

export async function getCoupleRouteContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: error?.message ?? "Please sign in again." },
        { status: 401 },
      ),
    };
  }

  try {
    const wedding = await getWeddingForCurrentUser(supabase, user.id);
    return {
      ok: true as const,
      supabase,
      user,
      wedding,
    };
  } catch (caughtError) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load your wedding workspace.",
        },
        { status: 400 },
      ),
    };
  }
}
