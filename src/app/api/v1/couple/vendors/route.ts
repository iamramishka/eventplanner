import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCoupleRouteContext } from "@/lib/supabase/couple-route-helpers";
import { mapWeddingVendorRow } from "@/lib/supabase/couple-planning-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Supabase is not configured for this environment." }, { status: 501 });
  }

  const context = await getCoupleRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { data, error } = await context.supabase
    .from("wedding_vendors")
    .select("*")
    .eq("wedding_id", String(context.wedding.id))
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    items: ((data ?? []) as Array<Record<string, unknown>>).map((row) =>
      mapWeddingVendorRow(row, String(context.wedding.slug)),
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
    name: string;
    category: string;
    phone: string;
    whatsapp: string;
    email: string;
    note: string;
    status: "Shortlisted" | "Contacted" | "Booked";
    linkedBudgetItemId?: string;
  };

  const row = {
    id: randomUUID(),
    wedding_id: String(context.wedding.id),
    name: payload.name.trim(),
    category: payload.category.trim(),
    phone: payload.phone.trim(),
    whatsapp: payload.whatsapp.trim(),
    email: payload.email.trim(),
    note: payload.note,
    status: payload.status,
    linked_budget_item_id: payload.linkedBudgetItemId || null,
  };

  const { error } = await context.supabase.from("wedding_vendors").insert(row);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    item: mapWeddingVendorRow(row, String(context.wedding.slug)),
  });
}
