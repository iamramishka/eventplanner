import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAdminRouteContext } from "@/lib/supabase/admin-route-helpers";
import { getAuditLogRecords } from "@/lib/supabase/admin-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getAdminRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const logs = await getAuditLogRecords(context.supabase);
  return NextResponse.json({ logs });
}
