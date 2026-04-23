import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { buildAppSession } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const payload = (await request.json()) as {
    email: string;
    password: string;
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { message: error?.message ?? "Invalid credentials." },
      { status: 400 },
    );
  }

  const session = await buildAppSession(supabase, data.user);
  return NextResponse.json({ session });
}
