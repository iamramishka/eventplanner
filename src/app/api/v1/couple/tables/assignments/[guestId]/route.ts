import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { guestId } = await params;
  const { data: guest, error: guestError } = await context.supabase
    .from("guests")
    .select("id")
    .eq("id", guestId)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (guestError || !guest) {
    return NextResponse.json(
      { message: guestError?.message ?? "Guest not found." },
      { status: 404 },
    );
  }

  const { error } = await context.supabase
    .from("wedding_table_assignments")
    .delete()
    .eq("guest_id", guestId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
