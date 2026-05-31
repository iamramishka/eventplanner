import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { assertCronRequest } from "@/lib/server/cron";
import { captureServerError, logSystemEvent } from "@/lib/server/logger";
import { expireTrialSubscriptions, moveExpiredSubscriptionsToGrace } from "@/lib/server/trial-lifecycle";

async function handle(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const expiredCount = await expireTrialSubscriptions(supabase);
    const graceCount = await moveExpiredSubscriptionsToGrace(supabase);

    await logSystemEvent({
      level: "info",
      source: "trial-expire-cron",
      message: "Trial expiry job completed.",
      context: { expiredCount, graceCount },
    });

    return NextResponse.json({ ok: true, expiredCount, graceCount });
  } catch (error) {
    await captureServerError("trial-expire-cron", error, {
      requestPath: "/api/internal/cron/trials/expire",
    });
    return NextResponse.json({ message: "Trial expiry job failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
