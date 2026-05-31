import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { buildInvitationPageDataFromSlug } from "@/lib/supabase/invitation-helpers";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ message: "Supabase service role is not configured for invitation reads." }, { status: 501 });
  }

  const { slug } = await params;
  const token = new URL(request.url).searchParams.get("token");

  try {
    const page = await buildInvitationPageDataFromSlug(createSupabaseAdminClient(), slug, token);
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load invitation." },
      { status: 400 },
    );
  }
}
