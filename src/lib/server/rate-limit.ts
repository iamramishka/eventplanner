import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { logSystemEvent } from "@/lib/server/logger";

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function buildRateLimitKey(parts: Array<string | number | undefined | null>) {
  return parts
    .filter((item) => item !== undefined && item !== null && String(item).trim())
    .map((item) => String(item).trim().toLowerCase())
    .join(":");
}

export async function enforceRateLimit(
  request: Request,
  options: {
    scope: string;
    key: string;
    max: number;
    windowMs: number;
    message: string;
  },
) {
  if (!isSupabaseServiceConfigured() || !options.key) {
    return null;
  }

  const client = createSupabaseAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: existing, error } = await client
    .from("request_rate_limits")
    .select("*")
    .eq("scope", options.scope)
    .eq("key", options.key)
    .maybeSingle();

  if (error) {
    await logSystemEvent({
      level: "warning",
      source: "rate-limit",
      message: "Falling back to allow because the rate limit store could not be read.",
      context: { requestPath: new URL(request.url).pathname, scope: options.scope },
    });
    return null;
  }

  const expiresAt = new Date(now.getTime() + options.windowMs).toISOString();
  const expired = !existing || new Date(existing.expires_at).getTime() <= now.getTime();

  if (expired) {
    await client.from("request_rate_limits").upsert(
      {
        scope: options.scope,
        key: options.key,
        count: 1,
        window_start: nowIso,
        expires_at: expiresAt,
      },
      { onConflict: "scope,key" },
    );
    return null;
  }

  if (Number(existing.count ?? 0) >= options.max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(existing.expires_at).getTime() - now.getTime()) / 1000),
    );

    await logSystemEvent({
      level: "warning",
      source: "rate-limit",
      message: "Request throttled.",
      context: {
        requestPath: new URL(request.url).pathname,
        scope: options.scope,
        key: options.key,
        retryAfterSeconds,
      },
    });

    return NextResponse.json(
      { message: options.message, retryAfterSeconds },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      },
    );
  }

  await client
    .from("request_rate_limits")
    .update({
      count: Number(existing.count ?? 0) + 1,
      expires_at: existing.expires_at,
    })
    .eq("scope", options.scope)
    .eq("key", options.key);

  return null;
}
