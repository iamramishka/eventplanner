import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { findTableByTokenFromDb } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for table lookup." }, { status: 501 });
  }

  const { token } = await params;

  const throttled = await enforceRateLimit(request, {
    scope: "public-table-token",
    key: buildRateLimitKey([token, getRequestIp(request)]),
    max: getRateLimitConfig().table.max,
    windowMs: getRateLimitConfig().table.windowMs,
    message: "Too many table lookups. Please try again shortly.",
  });

  if (throttled) {
    return throttled;
  }

  try {
    const result = await findTableByTokenFromDb(createSupabaseAdminClient(), token);
    return NextResponse.json({ result });
  } catch (error) {
    await captureServerError("public-table-token", error, {
      requestPath: `/api/v1/invitations/table/${token}`,
      token,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load table lookup." },
      { status: 400 },
    );
  }
}
