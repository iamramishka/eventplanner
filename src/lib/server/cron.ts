import "server-only";

import { NextResponse } from "next/server";
import { getCronSecret } from "@/lib/server/env";

export function assertCronRequest(request: Request) {
  const expected = getCronSecret();
  const actual = request.headers.get("authorization");

  if (!actual || actual !== `Bearer ${expected}`) {
    return NextResponse.json({ message: "Invalid cron authorization." }, { status: 401 });
  }

  return null;
}
