import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  loadVendorServices,
  mapVendorServiceRow,
} from "@/lib/supabase/vendor-helpers";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const items = await loadVendorServices(context.supabase, context.user.id);
  return NextResponse.json({ services: items });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { message: "Supabase is not configured for this environment." },
      { status: 501 },
    );
  }

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const payload = (await request.json()) as {
    title: string;
    description: string;
    isActive: boolean;
  };

  const title = payload.title.trim();
  if (!title) {
    return NextResponse.json({ message: "Service title is required." }, { status: 400 });
  }

  const { data: existingRows, error: existingError } = await context.supabase
    .from("vendor_services")
    .select("id")
    .eq("vendor_id", context.user.id)
    .order("sort_order", { ascending: true });

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  const row = {
    id: randomUUID(),
    vendor_id: context.user.id,
    title,
    description: payload.description.trim(),
    is_active: Boolean(payload.isActive),
    sort_order: (existingRows ?? []).length,
  };

  const { data: createdRow, error } = await context.supabase
    .from("vendor_services")
    .insert(row)
    .select("*")
    .maybeSingle();

  if (error || !createdRow) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to create vendor service." },
      { status: 400 },
    );
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    service: mapVendorServiceRow(createdRow as Record<string, unknown>, []),
  });
}
