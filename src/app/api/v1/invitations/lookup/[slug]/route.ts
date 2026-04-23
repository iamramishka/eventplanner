import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { findTableByGuestNameFromDb } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for table lookup." }, { status: 501 });
  }

  const { slug } = await params;
  const payload = (await request.json()) as { query: string };

  try {
    const result = await findTableByGuestNameFromDb(
      createSupabaseAdminClient(),
      slug,
      payload.query,
    );
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to find table assignment." },
      { status: 400 },
    );
  }
}
