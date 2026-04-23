import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { buildAppSession } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ session: null });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({ session: null });
  }

  const session = await buildAppSession(supabase, user);
  return NextResponse.json({ session });
}
