import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapWeddingVendorRow } from "@/lib/supabase/couple-planning-helpers";

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
    name: string;
    category: string;
    phone: string;
    whatsapp: string;
    email: string;
    note: string;
    status: "Shortlisted" | "Contacted" | "Booked";
    linkedBudgetItemId?: string;
  };

  const update = {
    name: payload.name.trim(),
    category: payload.category.trim(),
    phone: payload.phone.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
    note: payload.note,
    status: payload.status,
    linked_budget_item_id: payload.linkedBudgetItemId || null,
  };

  const { error } = await context.supabase
    .from("wedding_vendors")
    .update(update)
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapWeddingVendorRow({ id, ...update }, String(context.wedding.slug)),
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
    .from("wedding_vendors")
    .delete()
    .eq("id", id)
    .eq("wedding_id", String(context.wedding.id));

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
