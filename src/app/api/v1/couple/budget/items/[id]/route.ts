import { NextResponse } from "next/server";
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

  const update = {
    category: payload.category,
    title: payload.title.trim(),
    estimated_amount: payload.estimatedAmount,
    actual_amount: payload.actualAmount,
    paid_amount: payload.paidAmount,
    note: payload.note,
    due_date: payload.dueDate || null,
    status: payload.status,
  };

  const { error } = await context.supabase
    .from("budget_items")
    .update(update)
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapBudgetItemRow({ id, ...update }, String(context.wedding.slug)),
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
    .from("budget_items")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
