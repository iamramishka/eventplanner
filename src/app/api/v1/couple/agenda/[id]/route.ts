import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapAgendaItemRow } from "@/lib/supabase/couple-planning-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const payload = (await request.json()) as {
    title: string;
    eventTime: string;
    durationMinutes: number;
    description: string;
    iconKey: string;
  };

  const update = {
    title: payload.title.trim(),
    event_time: payload.eventTime,
    duration_minutes: payload.durationMinutes,
    description: payload.description,
    icon_key: payload.iconKey.trim() || "sparkles",
  };

  const { error } = await context.supabase
    .from("agenda_items")
    .update(update)
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapAgendaItemRow(
      {
        id,
        wedding_id: String(context.wedding.id),
        sort_order: 0,
        ...update,
      },
      String(context.wedding.slug),
    ),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const { error } = await context.supabase
    .from("agenda_items")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
