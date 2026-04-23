import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { assertCronRequest } from "@/lib/server/cron";
import { captureServerError, logSystemEvent } from "@/lib/server/logger";
import { suspendGraceExpiredSubscriptions } from "@/lib/server/trial-lifecycle";

async function handle(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const cleanedCount = await suspendGraceExpiredSubscriptions(supabase);

    await logSystemEvent({
      level: "info",
      source: "trial-cleanup-cron",
      message: "Trial cleanup job completed.",
      context: { cleanedCount },
    });

    return NextResponse.json({ ok: true, cleanedCount });
  } catch (error) {
    await captureServerError("trial-cleanup-cron", error, {
      requestPath: "/api/internal/cron/trials/cleanup",
    });
    return NextResponse.json({ message: "Trial cleanup job failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
