import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  toStoredWedding,
  toSubscriptionSnapshot,
  toWeddingSettings,
} from "@/lib/supabase/couple-helpers";
import { buildAppSession } from "@/lib/supabase/auth-helpers";
import { isSupabaseConfigured, isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { getInvitationWorkspaceForWedding } from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ bootstrap: null });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ bootstrap: null }, { status: 401 });
  }

  const session = await buildAppSession(supabase, user);
  if (session.role !== "couple" || !session.hasWedding) {
    return NextResponse.json({ bootstrap: null, session });
  }

  const { data: wedding, error: weddingError } = await supabase
    .from("weddings")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (weddingError || !wedding) {
    return NextResponse.json(
      { message: weddingError?.message ?? "Wedding not found." },
      { status: 404 },
    );
  }

  const { data: subscriptionRow } = await supabase
    .from("wedding_subscriptions")
    .select("status, plans(name, gallery_limit, features)")
    .eq("wedding_id", wedding.id)
    .maybeSingle();

  const invitationClient = isSupabaseServiceConfigured()
    ? createSupabaseAdminClient()
    : supabase;

  return NextResponse.json({
    session,
    bootstrap: {
      wedding: toStoredWedding(wedding),
      settings: toWeddingSettings(wedding),
      subscription: toSubscriptionSnapshot(subscriptionRow),
      invitation: await getInvitationWorkspaceForWedding(
        invitationClient,
        String(wedding.id),
        String(wedding.slug),
      ),
    },
  });
}
