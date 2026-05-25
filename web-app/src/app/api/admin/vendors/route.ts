import { NextResponse } from 'next/server';
import { getAllVendors, addVendorRegistration, deleteVendor, toPublicVendor } from '@/lib/vendorStore';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/rbac';

export async function GET() {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const all = getAllVendors().map(toPublicVendor);
    return NextResponse.json({ ok: true, data: { vendors: all } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const created = addVendorRegistration(body);
    await auditLog({ action: 'vendor-create', targetId: created.id, data: { businessName: created.businessName } });
    return NextResponse.json({ ok: true, status: 201, data: { vendor: toPublicVendor(created) } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Expect query param ?id=...
    const url = new URL(req.url);
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
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
