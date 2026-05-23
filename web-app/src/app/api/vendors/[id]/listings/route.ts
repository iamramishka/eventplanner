import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  getListingsByVendor,
  addListing,
} from '@/lib/vendorStore';

// ─── GET /api/vendors/[id]/listings ─────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getVendorById(id)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }
    const listings = getListingsByVendor(id);
    return NextResponse.json({ listings, total: listings.length });
  } catch (err: any) {
    console.error('[GET /api/vendors/[id]/listings]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── POST /api/vendors/[id]/listings — create listing ────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!getVendorById(id)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const body = await req.json();

    // Validation
    if (!String(body.title || '').trim()) {
      return NextResponse.json({ error: 'Listing title is required.' }, { status: 400 });
    }
    if (!body.category) {
      return NextResponse.json({ error: 'Listing category is required.' }, { status: 400 });
    }
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Price must be a non-negative number.' }, { status: 400 });
    }
    if (body.galleryImages && body.galleryImages.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 gallery images per listing.' }, { status: 400 });
    }

    const listing = addListing({
      vendorId: id,
      title: String(body.title).trim(),
      category: String(body.category),
      subcategory: String(body.subcategory || ''),
      description: String(body.description || '').trim(),
      price,
      currency: String(body.currency || 'LKR'),
      pricingType: body.pricingType || 'fixed',
      coverImageBase64: body.coverImageBase64 || null,
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      seoTitle: String(body.seoTitle || '').trim(),
      seoDescription: String(body.seoDescription || '').trim(),
      contentMarkdown: String(body.contentMarkdown || '').trim(),
      active: body.active !== false,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/vendors/[id]/listings]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
