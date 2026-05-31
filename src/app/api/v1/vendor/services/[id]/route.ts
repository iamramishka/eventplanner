import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  loadVendorServices,
  mapVendorServiceRow,
} from "@/lib/supabase/vendor-helpers";

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

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const payload = (await request.json()) as {
    title: string;
    description: string;
    isActive: boolean;
  };

  const title = payload.title.trim();
  if (!title) {
    return NextResponse.json({ message: "Service title is required." }, { status: 400 });
  }

  const existingServices = await loadVendorServices(context.supabase, context.user.id);
  const existingService = existingServices.find((item) => item.id === id);
  if (!existingService) {
    return NextResponse.json({ message: "Service not found." }, { status: 404 });
  }

  const { data: updatedRow, error } = await context.supabase
    .from("vendor_services")
    .update({
      title,
      description: payload.description.trim(),
      is_active: Boolean(payload.isActive),
    })
    .eq("id", id)
    .eq("vendor_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !updatedRow) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor service." },
      { status: 400 },
    );
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    service: mapVendorServiceRow(updatedRow as Record<string, unknown>, existingService.packages),
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

  const context = await getVendorRouteContext();
  if (!context.ok) {
    return context.response;
  }

  const { id } = await params;
  const { data: existingRow, error: existingError } = await context.supabase
    .from("vendor_services")
    .select("id")
    .eq("id", id)
    .eq("vendor_id", context.user.id)
    .maybeSingle();

  if (existingError || !existingRow) {
    return NextResponse.json(
      { message: existingError?.message ?? "Service not found." },
      { status: 404 },
    );
  }

  const { error: packagesError } = await context.supabase
    .from("vendor_service_packages")
    .delete()
    .eq("service_id", id);

  if (packagesError) {
    return NextResponse.json({ message: packagesError.message }, { status: 400 });
  }

  const { error } = await context.supabase
    .from("vendor_services")
    .delete()
    .eq("id", id)
    .eq("vendor_id", context.user.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const { data: remainingRows, error: remainingError } = await context.supabase
    .from("vendor_services")
    .select("id")
    .eq("vendor_id", context.user.id)
    .order("sort_order", { ascending: true });

  if (remainingError) {
    return NextResponse.json({ message: remainingError.message }, { status: 400 });
  }

  for (const [index, item] of (remainingRows ?? []).entries()) {
    const { error: reorderError } = await context.supabase
      .from("vendor_services")
      .update({ sort_order: index })
      .eq("id", String(item.id))
      .eq("vendor_id", context.user.id);

    if (reorderError) {
      return NextResponse.json({ message: reorderError.message }, { status: 400 });
    }
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({ ok: true });
}
