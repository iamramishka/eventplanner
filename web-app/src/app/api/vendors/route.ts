import { NextRequest, NextResponse } from 'next/server';
import { getAllVendors, toPublicVendor, getPendingVendors } from '@/lib/vendorStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('q');

    let vendors = getAllVendors();

    // Filter by status
    if (status === 'pending') {
      vendors = getPendingVendors();
    } else if (status) {
      vendors = vendors.filter(v => v.status === status);
    } else {
      // Default: only show approved vendors publicly
      vendors = vendors.filter(v => v.status === 'approved');
    }

    // Filter by category
    if (category) {
      vendors = vendors.filter(v => v.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      vendors = vendors.filter(v =>
        v.businessName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }

    vendors = vendors.slice().sort((a, b) => {
      const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDelta) return featuredDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      vendors: vendors.map(toPublicVendor),
      total: vendors.length,
    });
  } catch (err: unknown) {
    console.error('[GET /api/vendors]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
