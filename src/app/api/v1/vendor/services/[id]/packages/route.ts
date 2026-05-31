import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  mapVendorPackageRow,
} from "@/lib/supabase/vendor-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  const payload = (await request.json()) as {
    packageName: string;
    description: string;
    priceNote: string;
    inclusions: string[];
    isActive: boolean;
  };

  const packageName = payload.packageName.trim();
  if (!packageName) {
    return NextResponse.json({ message: "Package name is required." }, { status: 400 });
  }

  const { data: service, error: serviceError } = await context.supabase
    .from("vendor_services")
    .select("id")
    .eq("id", id)
    .eq("vendor_id", context.user.id)
    .maybeSingle();

  if (serviceError || !service) {
    return NextResponse.json(
      { message: serviceError?.message ?? "Service not found." },
      { status: 404 },
    );
  }

  const { data: existingRows, error: existingError } = await context.supabase
    .from("vendor_service_packages")
    .select("id")
    .eq("service_id", id)
    .order("sort_order", { ascending: true });

  if (existingError) {
    return NextResponse.json({ message: existingError.message }, { status: 400 });
  }

  const row = {
    id: randomUUID(),
    service_id: id,
    package_name: packageName,
    description: payload.description.trim(),
    price_note: payload.priceNote.trim(),
    inclusions: payload.inclusions ?? [],
    is_active: Boolean(payload.isActive),
    sort_order: (existingRows ?? []).length,
  };

  const { data: createdRow, error } = await context.supabase
    .from("vendor_service_packages")
    .insert(row)
    .select("*")
    .maybeSingle();

  if (error || !createdRow) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to create vendor package." },
      { status: 400 },
    );
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    package: mapVendorPackageRow(createdRow as Record<string, unknown>),
  });
}
