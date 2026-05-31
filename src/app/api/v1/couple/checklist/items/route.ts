import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import {
  ensureChecklistSeeded,
  mapChecklistItemRow,
} from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  await ensureChecklistSeeded(
    context.supabase,
    String(context.wedding.id),
    String(context.wedding.slug),
  );

  const { data, error } = await context.supabase
    .from("checklist_items")
    .select("*")
    .eq("wedding_id", String(context.wedding.id))
    .order("group_name", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) =>
      mapChecklistItemRow(row, String(context.wedding.slug)),
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
    group: string;
    title: string;
    description: string;
    dueDate?: string;
    priority: "Low" | "Medium" | "High";
    isCompleted: boolean;
  };

  const row = {
    id: randomUUID(),
    wedding_id: String(context.wedding.id),
    group_name: payload.group.trim(),
    title: payload.title.trim(),
    description: payload.description,
    due_date: payload.dueDate || null,
    priority: payload.priority,
    is_completed: payload.isCompleted,
  };

  const { error } = await context.supabase.from("checklist_items").insert(row);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapChecklistItemRow(row, String(context.wedding.slug)),
  });
}
