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
    role: "couple" | "vendor";
    fullName: string;
    email: string;
    password: string;
    businessName?: string;
  };

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    options: {
      data: {
        role: payload.role,
        full_name: payload.fullName.trim(),
        business_name: payload.businessName?.trim() ?? "",
      },
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ message: "Unable to create account." }, { status: 500 });
  }

  if (!data.session) {
    return NextResponse.json(
      {
        message:
          "Supabase email confirmation is enabled. Disable email confirmation for this MVP flow or confirm the account before continuing.",
      },
      { status: 409 },
    );
  }

  const session = await buildAppSession(supabase, data.user);
  return NextResponse.json({ session });
}
