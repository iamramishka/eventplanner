import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ensureGuestInvite, getWeddingForCurrentUser } from "@/lib/supabase/guest-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ guestId: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const { guestId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  await getWeddingForCurrentUser(supabase, user.id);
  const sentAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("guests")
    .update({ last_invite_sent_at: sentAt, updated_at: sentAt })
    .eq("id", guestId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  const invite = await ensureGuestInvite(supabase, guestId, sentAt);
  return NextResponse.json({
    inviteToken: String(invite.invite_token),
    sentAt,
  });
}
