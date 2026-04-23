import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapAgendaItemRow } from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { data, error } = await context.supabase
    .from("agenda_items")
    .select("*")
    .eq("wedding_id", String(context.wedding.id))
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) =>
      mapAgendaItemRow(row, String(context.wedding.slug)),
    ),
  });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const payload = (await request.json()) as {
    title: string;
    eventTime: string;
    durationMinutes: number;
    description: string;
    iconKey: string;
  };

  const { data: existingRows, error: existingError } = await context.supabase
    .from("agenda_items")
    .select("id")
    .eq("wedding_id", String(context.wedding.id));

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  const row = {
    id: randomUUID(),
    wedding_id: String(context.wedding.id),
    title: payload.title.trim(),
    event_time: payload.eventTime,
    duration_minutes: payload.durationMinutes,
    description: payload.description,
    icon_key: payload.iconKey.trim() || "sparkles",
    sort_order: (existingRows ?? []).length,
  };

  const { error } = await context.supabase.from("agenda_items").insert(row);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapAgendaItemRow(row, String(context.wedding.slug)),
  });
}
