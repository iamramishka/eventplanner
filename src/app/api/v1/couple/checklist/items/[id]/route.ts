import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapChecklistItemRow } from "@/lib/supabase/couple-planning-helpers";

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
    group: string;
    title: string;
    description: string;
    dueDate?: string;
    priority: "Low" | "Medium" | "High";
    isCompleted: boolean;
  };

  const update = {
    group_name: payload.group.trim(),
    title: payload.title.trim(),
    description: payload.description,
    due_date: payload.dueDate || null,
    priority: payload.priority,
    is_completed: payload.isCompleted,
  };

  const { error } = await context.supabase
    .from("checklist_items")
    .update(update)
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapChecklistItemRow({ id, ...update }, String(context.wedding.slug)),
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
    .from("checklist_items")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
