import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { buildInvitationPageDataFromToken, submitGuestRsvpByToken } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getRateLimitConfig } from "@/lib/server/env";
import { buildRateLimitKey, enforceRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { captureServerError } from "@/lib/server/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for invitation reads." }, { status: 501 });
  }

  const { token } = await params;

  const throttled = await enforceRateLimit(request, {
    scope: "public-rsvp-read",
    key: buildRateLimitKey([token, getRequestIp(request)]),
    max: getRateLimitConfig().rsvp.max,
    windowMs: getRateLimitConfig().rsvp.windowMs,
    message: "Too many RSVP requests. Please try again shortly.",
  });

  if (throttled) {
    return throttled;
  }

  try {
    const page = await buildInvitationPageDataFromToken(createSupabaseAdminClient(), token);
    return NextResponse.json({ page });
  } catch (error) {
    await captureServerError("public-rsvp-read", error, {
      requestPath: `/api/v1/invitations/rsvp/${token}`,
      token,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load RSVP page." },
      { status: 400 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for RSVP writes." }, { status: 501 });
  }

  const { token } = await params;
  const payload = (await request.json()) as {
    status: "pending" | "confirmed" | "declined";
    attendingCount: number;
    mealPreference: "Standard" | "Vegetarian" | "Vegan" | "Halal";
    liquorPreference: "Yes" | "No" | "Undecided";
    specialNote: string;
  };

  const throttled = await enforceRateLimit(request, {
    scope: "public-rsvp-write",
    key: buildRateLimitKey([token, getRequestIp(request)]),
    max: getRateLimitConfig().rsvp.max,
    windowMs: getRateLimitConfig().rsvp.windowMs,
    message: "Too many RSVP updates. Please wait before trying again.",
  });

  if (throttled) {
    return throttled;
  }

  try {
    const page = await submitGuestRsvpByToken(createSupabaseAdminClient(), token, payload);
    return NextResponse.json({ page });
  } catch (error) {
    await captureServerError("public-rsvp-write", error, {
      requestPath: `/api/v1/invitations/rsvp/${token}`,
      token,
    });
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to save RSVP." },
      { status: 400 },
    );
  }
}
