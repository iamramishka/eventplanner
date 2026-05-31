import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
