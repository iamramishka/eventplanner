import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import {
  mapTableAssignmentRow,
  mapTableRow,
} from "@/lib/supabase/couple-planning-helpers";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

async function loadTableWorkspace(weddingId: string, weddingSlug: string, supabase: unknown) {
  const queryClient = asQueryClient(supabase);
  const { data: tableRows, error: tableError } = await queryClient
    .from("wedding_tables")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order", { ascending: true });

  if (tableError) {
    throw new Error(tableError.message);
  }

  const tables = ((tableRows ?? []) as Array<Record<string, unknown>>).map((row) =>
    mapTableRow(row, weddingSlug),
  );
  const tableIds = tables.map((table: (typeof tables)[number]) => table.id);

  if (!tableIds.length) {
    return { tables, assignments: [] };
  }

  const { data: assignmentRows, error: assignmentError } = await queryClient
    .from("wedding_table_assignments")
    .select("*")
    .in("table_id", tableIds);

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  return {
    tables,
    assignments: ((assignmentRows ?? []) as Array<Record<string, unknown>>).map((row) =>
      mapTableAssignmentRow(row, weddingSlug),
    ),
  };
}

export async function GET() {
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

  try {
    return NextResponse.json(
      await loadTableWorkspace(
        String(context.wedding.id),
        String(context.wedding.slug),
        context.supabase,
      ),
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to load tables." },
      { status: 400 },
    );
  }
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

  const existingWorkspace = await loadTableWorkspace(
    String(context.wedding.id),
    String(context.wedding.slug),
    context.supabase,
  );

  const row = {
    id: randomUUID(),
    wedding_id: String(context.wedding.id),
    table_name: payload.tableName.trim(),
    capacity: Math.floor(payload.capacity),
    sort_order: existingWorkspace.tables.length,
  };

  const { error } = await context.supabase.from("wedding_tables").insert(row);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    table: mapTableRow(row, String(context.wedding.slug)),
  });
}
