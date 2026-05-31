import { NextResponse } from 'next/server';
import { deleteVendor, getVendorById, toPublicVendor, updateVendor } from '@/lib/vendorStore';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/rbac';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const { id } = await params;
    const body = await req.json();
    const existing = getVendorById(id);
    if (!existing) return NextResponse.json({ ok: false, error: 'vendor not found' }, { status: 404 });

    const patch: Record<string, unknown> = {};
    if ('featured' in body) patch.featured = Boolean(body.featured);
    if ('status' in body && ['pending_review', 'approved', 'rejected', 'suspended'].includes(body.status)) {
      patch.status = body.status;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: 'no supported fields provided' }, { status: 400 });
    }

    const updated = updateVendor(id, patch);
    if (!updated) return NextResponse.json({ ok: false, error: 'update failed' }, { status: 500 });

    await auditLog({ action: 'vendor-admin-update', targetId: id, data: patch });
    return NextResponse.json({ ok: true, data: { vendor: toPublicVendor(updated) } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const { id } = await params;
    const removed = deleteVendor(id);
    if (!removed) return NextResponse.json({ ok: false, error: 'vendor not found' }, { status: 404 });

    await auditLog({ action: 'vendor-delete', targetId: id, data: { businessName: removed.businessName } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
