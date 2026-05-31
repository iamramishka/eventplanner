import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { buildInvitationPageDataFromToken } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for invitation reads." }, { status: 501 });
  }

  const { token } = await params;

  try {
    const page = await buildInvitationPageDataFromToken(createSupabaseAdminClient(), token);
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load invitation." },
      { status: 400 },
    );
  }
}
