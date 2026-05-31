import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";

function getLatestRsvpCount(rows: Array<Record<string, unknown>>) {
  return Number(rows[0]?.attending_count ?? 0);
}

export async function POST(request: Request) {
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

  const payload = (await request.json()) as {
    tableId: string;
    guestId: string;
    assignedCount: number;
  };

  if (!payload.tableId || !payload.guestId) {
    return NextResponse.json(
      { message: "Table and guest are required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(payload.assignedCount) || payload.assignedCount < 1) {
    return NextResponse.json(
      { message: "Assigned count must be at least 1." },
      { status: 400 },
    );
  }

  const { data: table, error: tableError } = await context.supabase
    .from("wedding_tables")
    .select("*")
    .eq("id", payload.tableId)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (tableError || !table) {
    return NextResponse.json(
      { message: tableError?.message ?? "Table not found." },
      { status: 404 },
    );
  }

  const { data: guest, error: guestError } = await context.supabase
    .from("guests")
    .select("*")
    .eq("id", payload.guestId)
    .eq("wedding_id", String(context.wedding.id))
    .maybeSingle();

  if (guestError || !guest) {
    return NextResponse.json(
      { message: guestError?.message ?? "Guest not found." },
      { status: 404 },
    );
  }

  const { data: latestRows, error: rsvpError } = await context.supabase
    .from("rsvp_responses")
    .select("status, attending_count, submitted_at")
    .eq("guest_id", payload.guestId)
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (rsvpError) {
    return NextResponse.json({ message: rsvpError.message }, { status: 400 });
  }

  const latest = (latestRows ?? [])[0];
  if (!latest || latest.status !== "confirmed") {
    return NextResponse.json(
      { message: "Only confirmed guests can be assigned to tables." },
      { status: 400 },
    );
  }

  const confirmedCount = getLatestRsvpCount((latestRows ?? []) as Array<Record<string, unknown>>);
  if (payload.assignedCount > confirmedCount) {
    return NextResponse.json(
      { message: "Assigned count cannot exceed confirmed attending count." },
      { status: 400 },
    );
  }

  const { data: existingAssignments, error: assignmentError } = await context.supabase
    .from("wedding_table_assignments")
    .select("id, guest_id, assigned_count")
    .eq("table_id", payload.tableId);

  if (assignmentError) {
    return NextResponse.json({ message: assignmentError.message }, { status: 400 });
  }

  const usedCapacity = (existingAssignments ?? []).reduce(
    (total, item) =>
      total +
      (String(item.guest_id) === payload.guestId ? 0 : Number(item.assigned_count ?? 0)),
    0,
  );

  if (usedCapacity + payload.assignedCount > Number(table.capacity ?? 0)) {
    return NextResponse.json(
      { message: "This table does not have enough remaining capacity." },
      { status: 400 },
    );
  }

  const { data: existingAssignment, error: existingError } = await context.supabase
    .from("wedding_table_assignments")
    .select("id")
    .eq("guest_id", payload.guestId)
    .maybeSingle();

  if (existingError && !existingError.message.toLowerCase().includes("multiple")) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  if (existingAssignment) {
    const { error } = await context.supabase
      .from("wedding_table_assignments")
      .update({
        table_id: payload.tableId,
        assigned_count: Math.floor(payload.assignedCount),
      })
      .eq("id", String(existingAssignment.id));

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  } else {
    const { error } = await context.supabase.from("wedding_table_assignments").insert({
      id: randomUUID(),
      table_id: payload.tableId,
      guest_id: payload.guestId,
      assigned_count: Math.floor(payload.assignedCount),
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
