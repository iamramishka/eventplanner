import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  updateVendor,
  getOnboardingProgress,
  toPublicVendor,
} from '@/lib/vendorStore';
import { requireVendorAccess } from '@/lib/rbac';

type VendorPatch = Parameters<typeof updateVendor>[1];

// ─── GET /api/vendors/[id] ───────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor = getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }
    const progress = getOnboardingProgress(vendor);
    return NextResponse.json({ vendor: toPublicVendor(vendor), onboarding: progress });
  } catch (err: unknown) {
    console.error('[GET /api/vendors/[id]]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── PUT /api/vendors/[id] — update vendor profile ───────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireVendorAccess(id);
    if (access.response) return access.response;
    const vendor = getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const body = await req.json() as Record<string, unknown>;
    const allowed = [
      // Business profile
      'businessName', 'category', 'subcategory', 'description',
      'yearsInBusiness', 'website', 'location', 'serviceArea',
      // SEO
      'seoTitle', 'seoDescription', 'seoKeywords',
      // Media
      'logoBase64', 'portfolioImages', 'coverImageBase64',
      // Contact
      'phone', 'ownerFirstName', 'ownerLastName',
      // Pricing
      'basePrice', 'currency', 'pricingNotes', 'packages',
      // Markdown content
      'aboutMarkdown', 'faqMarkdown',
    ];

    // Media size limits (prevent memory exhaustion via large base64 payloads)
    const MAX_LOGO_B64 = 1 * 1024 * 1024;
    const MAX_COVER_B64 = 5 * 1024 * 1024;
    if (body.logoBase64 !== undefined && body.logoBase64 !== null && String(body.logoBase64).length > MAX_LOGO_B64) {
      return NextResponse.json({ error: "Logo image must be under 1 MB." }, { status: 400 });
    }
    if (body.coverImageBase64 !== undefined && body.coverImageBase64 !== null && String(body.coverImageBase64).length > MAX_COVER_B64) {
      return NextResponse.json({ error: "Cover image must be under 5 MB." }, { status: 400 });
    }

    // Validate required editable fields
    if (body.businessName !== undefined && !String(body.businessName || '').trim()) {
      return NextResponse.json({ error: 'Business name cannot be empty.' }, { status: 400 });
    }
    if (body.description !== undefined && String(body.description || '').trim().length < 30) {
      return NextResponse.json({ error: 'Description must be at least 30 characters.' }, { status: 400 });
    }
    if (body.basePrice !== undefined) {
      const price = Number(body.basePrice);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Starting price must be a non-negative number.' }, { status: 400 });
      }
    }
    if (body.portfolioImages !== undefined && !Array.isArray(body.portfolioImages)) {
      return NextResponse.json({ error: 'portfolioImages must be an array.' }, { status: 400 });
    }
    if (body.portfolioImages && body.portfolioImages.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 portfolio images allowed.' }, { status: 400 });
    }
    if (body.packages !== undefined && !Array.isArray(body.packages)) {
      return NextResponse.json({ error: 'packages must be an array.' }, { status: 400 });
    }
    if (body.packages && body.packages.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 packages allowed.' }, { status: 400 });
    }

    // Only allow whitelisted fields
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    const updated = updateVendor(id, patch as VendorPatch);
    if (!updated) {
      return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
    }

    return NextResponse.json({
      vendor: toPublicVendor(updated),
      onboarding: getOnboardingProgress(updated),
    });
  } catch (err: unknown) {
    console.error('[PUT /api/vendors/[id]]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── PATCH /api/vendors/[id] — partial update ────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}
