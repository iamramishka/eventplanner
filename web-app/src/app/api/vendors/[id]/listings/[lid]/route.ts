import { NextRequest, NextResponse } from 'next/server';
import {
  getListingById,
  updateListing,
  deleteListing,
  toggleListingActive,
} from '@/lib/vendorStore';

// ─── GET /api/vendors/[id]/listings/[lid] ───────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  try {
    const { id, lid } = await params;
    const listing = getListingById(lid);
    if (!listing || listing.vendorId !== id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }
    return NextResponse.json({ listing });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── PUT /api/vendors/[id]/listings/[lid] ───────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  try {
    const { id, lid } = await params;
    const existing = getListingById(lid);
    if (!existing || existing.vendorId !== id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const body = await req.json();

    // Validate
    if (body.title !== undefined && !String(body.title || '').trim()) {
      return NextResponse.json({ error: 'Listing title cannot be empty.' }, { status: 400 });
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Price must be a non-negative number.' }, { status: 400 });
      }
    }
    if (body.galleryImages && body.galleryImages.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 gallery images per listing.' }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    const allowed = [
      'title', 'category', 'subcategory', 'description', 'price', 'currency', 'pricingType',
      'coverImageBase64', 'galleryImages', 'tags', 'seoTitle', 'seoDescription', 'contentMarkdown', 'active',
    ];
    for (const key of allowed) {
      if (key in body) {
        patch[key] = key === 'title' ? String(body[key]).trim() : body[key];
      }
    }
    if (patch.price !== undefined) patch.price = Number(patch.price);

    const updated = updateListing(lid, patch);
    if (!updated) return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
    return NextResponse.json({ listing: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── PATCH /api/vendors/[id]/listings/[lid] ─────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  try {
    const { id, lid } = await params;
    const existing = getListingById(lid);
    if (!existing || existing.vendorId !== id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    const body = await req.json();

    // Special case: toggle active
    if (typeof body.active === 'boolean' && Object.keys(body).length === 1) {
      const toggled = toggleListingActive(lid, body.active);
      return NextResponse.json({ listing: toggled });
    }

    return PUT(req, { params });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── DELETE /api/vendors/[id]/listings/[lid] ────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lid: string }> }
) {
  try {
    const { id, lid } = await params;
    const existing = getListingById(lid);
    if (!existing || existing.vendorId !== id) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }
    const removed = deleteListing(lid);
    return NextResponse.json({ deleted: true, id: removed?.id });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
