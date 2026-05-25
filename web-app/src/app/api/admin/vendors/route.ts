import { NextResponse } from 'next/server';
import { getAllVendors, addVendorRegistration, deleteVendor, getVendorByEmail, toPublicVendor } from '@/lib/vendorStore';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/adminAuth';

function cleanString(value: unknown, maxLength = 300) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

export async function GET() {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const all = getAllVendors().map(toPublicVendor);
    return NextResponse.json({ ok: true, data: { vendors: all } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const body = await req.json();
    const email = cleanString(body?.email, 180).toLowerCase();
    const businessName = cleanString(body?.businessName, 180);
    const category = cleanString(body?.category, 120);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'valid email required' }, { status: 400 });
    }
    if (!businessName || !category) {
      return NextResponse.json({ ok: false, error: 'businessName and category required' }, { status: 400 });
    }
    if (getVendorByEmail(email)) {
      return NextResponse.json({ ok: false, error: 'vendor email already exists' }, { status: 409 });
    }

    const packages = Array.isArray(body?.packages)
      ? body.packages.slice(0, 10).map((item: any) => ({
        name: cleanString(item?.name, 120),
        price: cleanNumber(item?.price),
        description: cleanString(item?.description, 300),
      })).filter((item: any) => item.name)
      : [];

    const created = addVendorRegistration({
      ownerFirstName: cleanString(body?.ownerFirstName, 80) || 'Admin',
      ownerLastName: cleanString(body?.ownerLastName, 80) || 'Created',
      email,
      phone: cleanString(body?.phone, 40),
      passwordHash: '[admin-created]',
      businessName,
      category,
      subcategory: cleanString(body?.subcategory, 120),
      description: cleanString(body?.description, 1000) || `${businessName} vendor profile.`,
      yearsInBusiness: body?.yearsInBusiness ? cleanNumber(body.yearsInBusiness) : null,
      website: cleanString(body?.website, 300),
      location: cleanString(body?.location, 180),
      serviceArea: cleanString(body?.serviceArea, 180),
      logoBase64: null,
      portfolioImages: [],
      businessRegNumber: cleanString(body?.businessRegNumber, 120),
      taxIdNumber: cleanString(body?.taxIdNumber, 120),
      businessRegDocBase64: null,
      basePrice: cleanNumber(body?.basePrice),
      currency: cleanString(body?.currency, 12) || 'LKR',
      pricingNotes: cleanString(body?.pricingNotes, 500),
      packages,
    });
    await auditLog({ action: 'vendor-create', targetId: created.id, data: { businessName: created.businessName } });
    return NextResponse.json({ ok: true, status: 201, data: { vendor: toPublicVendor(created) } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    // Expect query param ?id=...
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'missing id' }, { status: 400 });
    const removed = deleteVendor(id);
    if (!removed) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
    await auditLog({ action: 'vendor-delete', targetId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
