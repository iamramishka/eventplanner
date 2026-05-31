import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  mapVendorPackageRow,
} from "@/lib/supabase/vendor-helpers";

async function getOwnedPackage(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server-client").createSupabaseServerClient>>,
  vendorId: string,
  packageId: string,
) {
  const { data: packageRow, error: packageError } = await supabase
    .from("vendor_service_packages")
    .select("*")
    .eq("id", packageId)
    .maybeSingle();

  if (packageError || !packageRow) {
    throw new Error(packageError?.message ?? "Package not found.");
  }

  const { data: service, error: serviceError } = await supabase
    .from("vendor_services")
    .select("id")
    .eq("id", String(packageRow.service_id))
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (serviceError || !service) {
    throw new Error(serviceError?.message ?? "Package not found.");
  }

  return packageRow;
}

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

  try {
    await getOwnedPackage(context.supabase, context.user.id, id);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Package not found." },
      { status: 404 },
    );
  }

  const { data: updatedRow, error } = await context.supabase
    .from("vendor_service_packages")
    .update({
      package_name: packageName,
      description: payload.description.trim(),
      price_note: payload.priceNote.trim(),
      inclusions: payload.inclusions ?? [],
      is_active: Boolean(payload.isActive),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !updatedRow) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor package." },
      { status: 400 },
    );
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    package: mapVendorPackageRow(updatedRow as Record<string, unknown>),
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
  let packageRow: Record<string, unknown>;

  try {
    packageRow = (await getOwnedPackage(context.supabase, context.user.id, id)) as Record<
      string,
      unknown
    >;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Package not found." },
      { status: 404 },
    );
  }

  const { error } = await context.supabase
    .from("vendor_service_packages")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const serviceId = String(packageRow.service_id);
  const { data: remainingRows, error: remainingError } = await context.supabase
    .from("vendor_service_packages")
    .select("id")
    .eq("service_id", serviceId)
    .order("sort_order", { ascending: true });

  if (remainingError) {
    return NextResponse.json({ message: remainingError.message }, { status: 400 });
  }

  for (const [index, item] of (remainingRows ?? []).entries()) {
    const { error: reorderError } = await context.supabase
      .from("vendor_service_packages")
      .update({ sort_order: index })
      .eq("id", String(item.id));

    if (reorderError) {
      return NextResponse.json({ message: reorderError.message }, { status: 400 });
    }
  }

  await applyVendorPostEditState(context.supabase, context.vendorProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({ ok: true });
}
