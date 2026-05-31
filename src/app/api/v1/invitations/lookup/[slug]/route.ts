import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { findTableByGuestNameFromDb } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for table lookup." }, { status: 501 });
  }

  const { slug } = await params;
  const payload = (await request.json()) as { query: string };

  const throttled = await enforceRateLimit(request, {
    scope: "public-table-name",
    key: buildRateLimitKey([slug, getRequestIp(request)]),
    max: getRateLimitConfig().table.max,
    windowMs: getRateLimitConfig().table.windowMs,
    message: "Too many table lookups. Please try again shortly.",
  });

  if (throttled) {
    return throttled;
  }

  try {
    const result = await findTableByGuestNameFromDb(
      createSupabaseAdminClient(),
      slug,
      payload.query,
    );
    return NextResponse.json({ result });
  } catch (error) {
    await captureServerError("public-table-name", error, {
      requestPath: `/api/v1/invitations/lookup/${slug}`,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to find table assignment." },
      { status: 400 },
    );
  }
}
