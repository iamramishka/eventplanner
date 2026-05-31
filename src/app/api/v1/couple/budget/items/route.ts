import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapBudgetItemRow } from "@/lib/supabase/couple-planning-helpers";

function validateBudgetPayload(payload: {
  estimatedAmount: number;
  actualAmount: number;
  paidAmount: number;
}) {
  if (payload.estimatedAmount < 0 || payload.actualAmount < 0 || payload.paidAmount < 0) {
    throw new Error("Budget amounts cannot be negative.");
  }

  if (payload.paidAmount > payload.actualAmount && payload.actualAmount > 0) {
    throw new Error("Paid amount cannot exceed the actual amount.");
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { data, error } = await context.supabase
    .from("budget_items")
    .select("*")
    .eq("wedding_id", String(context.wedding.id))
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) =>
      mapBudgetItemRow(row, String(context.wedding.slug)),
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
    category: string;
    title: string;
    estimatedAmount: number;
    actualAmount: number;
    paidAmount: number;
    note: string;
    dueDate?: string;
    status: "planned" | "booked" | "paid";
  };

  try {
    validateBudgetPayload(payload);
  } catch (caughtError) {
    return NextResponse.json(
      { message: caughtError instanceof Error ? caughtError.message : "Invalid budget item." },
      { status: 400 },
    );
  }

  const row = {
    id: randomUUID(),
    wedding_id: String(context.wedding.id),
    category: payload.category,
    title: payload.title.trim(),
    estimated_amount: payload.estimatedAmount,
    actual_amount: payload.actualAmount,
    paid_amount: payload.paidAmount,
    note: payload.note,
    due_date: payload.dueDate || null,
    status: payload.status,
  };

  const { error } = await context.supabase.from("budget_items").insert(row);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapBudgetItemRow(row, String(context.wedding.slug)),
  });
}
