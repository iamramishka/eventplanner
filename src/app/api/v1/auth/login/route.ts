import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { buildAppSession } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const payload = (await request.json()) as {
    email: string;
    password: string;
  };

  const throttled = await enforceRateLimit(request, {
    scope: "auth-login",
    key: buildRateLimitKey([payload.email, getRequestIp(request)]),
    max: getRateLimitConfig().login.max,
    windowMs: getRateLimitConfig().login.windowMs,
    message: "Too many login attempts. Please try again a little later.",
  });

  if (throttled) {
    return throttled;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  if (error || !data.user) {
    await captureServerError("auth-login", error ?? new Error("Invalid credentials."), {
      requestPath: "/api/v1/auth/login",
      role: "public",
    });
    return NextResponse.json(
      { message: error?.message ?? "Invalid credentials." },
      { status: 400 },
    );
  }

  const session = await buildAppSession(supabase, data.user);
  return NextResponse.json({ session });
}
