import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapTableRow } from "@/lib/supabase/couple-planning-helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;
  const payload = (await request.json()) as {
    tableName: string;
    capacity: number;
  };

  if (!payload.tableName.trim()) {
    return NextResponse.json({ message: "Table name is required." }, { status: 400 });
  }

  if (!Number.isFinite(payload.capacity) || payload.capacity < 1) {
    return NextResponse.json(
      { message: "Table capacity must be at least 1." },
      { status: 400 },
    );
  }

  const { data: existingTable, error: tableError } = await context.supabase
    .from("wedding_tables")
    .select("*")
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (tableError || !existingTable) {
    return NextResponse.json(
      { message: tableError?.message ?? "Table not found." },
      { status: 404 },
    );
  }

  const { data: assignments, error: assignmentError } = await context.supabase
    .from("wedding_table_assignments")
    .select("assigned_count")
    .eq("table_id", id);

  if (assignmentError) {
    return NextResponse.json({ message: assignmentError.message }, { status: 400 });
  }

  const usedCapacity = (assignments ?? []).reduce(
    (total, item) => total + Number(item.assigned_count ?? 0),
    0,
  );

  if (usedCapacity > payload.capacity) {
    return NextResponse.json(
      { message: "Table capacity cannot be reduced below the current assigned count." },
      { status: 400 },
    );
  }

  const update = {
    table_name: payload.tableName.trim(),
    capacity: Math.floor(payload.capacity),
  };

  const { error } = await context.supabase
    .from("wedding_tables")
    .update(update)
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    table: mapTableRow({ ...existingTable, id, ...update }, String(context.wedding.slug)),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  const { id } = await params;
  const { error } = await context.supabase
    .from("wedding_tables")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
