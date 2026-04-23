import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const payload = (await request.json()) as {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  };

  if (payload.nextPassword.length < 8) {
    return NextResponse.json(
      { message: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (payload.nextPassword !== payload.confirmPassword) {
    return NextResponse.json(
      { message: "New passwords do not match." },
      { status: 400 },
    );
  }

  const verifier = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email: context.user.email ?? "",
    password: payload.currentPassword,
  });

  if (verifyError) {
    return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
  }

  const { error } = await context.supabase.auth.updateUser({
    password: payload.nextPassword,
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
