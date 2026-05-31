import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { assertCronRequest } from "@/lib/server/cron";
import { captureServerError, logSystemEvent } from "@/lib/server/logger";
import { moveExpiredSubscriptionsToGrace } from "@/lib/server/trial-lifecycle";

async function handle(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) {
    return denied;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const graceCount = await moveExpiredSubscriptionsToGrace(supabase);

    await logSystemEvent({
      level: "info",
      source: "trial-grace-cron",
      message: "Trial grace transition job completed.",
      context: { graceCount },
    });

    return NextResponse.json({ ok: true, graceCount });
  } catch (error) {
    await captureServerError("trial-grace-cron", error, {
      requestPath: "/api/internal/cron/trials/grace",
    });
    return NextResponse.json({ message: "Trial grace job failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
