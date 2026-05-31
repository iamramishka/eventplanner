import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";

export async function POST(
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
  const { data: row, error: rowError } = await context.supabase
    .from("checklist_items")
    .select("is_completed")
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (rowError || !row) {
    return NextResponse.json({ message: rowError?.message ?? "Task not found." }, { status: 404 });
  }

  const { error } = await context.supabase
    .from("checklist_items")
    .update({ is_completed: !Boolean(row.is_completed) })
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ isCompleted: !Boolean(row.is_completed) });
}
