import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getVendorRouteContext } from "@/lib/supabase/vendor-route-helpers";
import {
  applyVendorPostEditState,
  mapVendorProfileRow,
} from "@/lib/supabase/vendor-helpers";
import { VendorCategory } from "@/types/vendor";

const allowedCategories = new Set<VendorCategory>([
  "Photography",
  "Videography",
  "Catering",
  "Decoration",
  "Makeup",
  "Music",
  "Transport",
  "Cake",
  "Venue",
  "Planning",
  "Other",
]);

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

  return NextResponse.json({
    profile: mapVendorProfileRow(context.vendorProfile),
  });
}

export async function PATCH(request: Request) {
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
    businessName: string;
    category: VendorCategory;
    tagline: string;
    description: string;
    location: string;
    coverageArea: string;
    experienceYears: number;
    priceRange: string;
  };

  const businessName = payload.businessName.trim();
  const description = payload.description.trim();
  const experienceYears = Number(payload.experienceYears ?? 0);

  if (!businessName) {
    return NextResponse.json({ message: "Business name is required." }, { status: 400 });
  }

  if (!allowedCategories.has(payload.category)) {
    return NextResponse.json({ message: "Vendor category is required." }, { status: 400 });
  }

  if (description.length < 40) {
    return NextResponse.json(
      { message: "Description should be at least 40 characters." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(experienceYears) || experienceYears < 0) {
    return NextResponse.json(
      { message: "Experience years cannot be negative." },
      { status: 400 },
    );
  }

  const { data: updatedProfile, error } = await context.supabase
    .from("vendor_profiles")
    .update({
      business_name: businessName,
      category: payload.category,
      tagline: payload.tagline.trim(),
      description,
      location: payload.location.trim(),
      coverage_area: payload.coverageArea.trim(),
      experience_years: experienceYears,
      price_range: payload.priceRange.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", context.user.id)
    .select("*")
    .maybeSingle();

  if (error || !updatedProfile) {
    return NextResponse.json(
      { message: error?.message ?? "Unable to update vendor profile." },
      { status: 400 },
    );
  }

  const nextRow = await applyVendorPostEditState(context.supabase, updatedProfile, {
    triggerRereview: true,
  });

  return NextResponse.json({
    profile: mapVendorProfileRow(nextRow as Record<string, unknown>),
  });
}
