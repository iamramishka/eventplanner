import { NextResponse } from 'next/server';
import { approveVendor, rejectVendor, getVendorById, toPublicVendor } from '@/lib/vendorStore';
import { auditLog } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, notes, reviewedBy } = body as { action: string; notes?: string; reviewedBy?: string };

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'invalid action' }, { status: 400 });
    }

    const existing = getVendorById(id);
    if (!existing) return NextResponse.json({ ok: false, error: 'vendor not found' }, { status: 404 });

    let updated = null;
    if (action === 'approve') {
      updated = approveVendor(id, reviewedBy || 'admin', notes);
      await auditLog({ action: 'vendor-approve', targetId: id, reviewedBy: reviewedBy || 'admin', notes: notes || null });
    } else {
      updated = rejectVendor(id, reviewedBy || 'admin', notes);
      await auditLog({ action: 'vendor-reject', targetId: id, reviewedBy: reviewedBy || 'admin', notes: notes || null });
    }

    if (!updated) return NextResponse.json({ ok: false, error: 'update failed' }, { status: 500 });
    return NextResponse.json({ ok: true, data: { vendor: toPublicVendor(updated) } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
