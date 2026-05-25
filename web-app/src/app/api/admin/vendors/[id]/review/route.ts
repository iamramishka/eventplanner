import { NextResponse } from 'next/server';
import { approveVendor, rejectVendor, getVendorById, toPublicVendor } from '@/lib/vendorStore';
import { auditLog } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/rbac';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const { id } = await params;
    const body = await req.json();
    const { action, notes, reviewedBy } = body as { action: string; notes?: string; reviewedBy?: string };
    const reviewer = typeof reviewedBy === 'string' && reviewedBy.trim()
      ? reviewedBy.trim().slice(0, 120)
      : 'admin';
    const reviewNotes = typeof notes === 'string' && notes.trim()
      ? notes.trim().slice(0, 1000)
      : undefined;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'invalid action' }, { status: 400 });
    }

    const existing = getVendorById(id);
    if (!existing) return NextResponse.json({ ok: false, error: 'vendor not found' }, { status: 404 });

    let updated = null;
    if (action === 'approve') {
      updated = approveVendor(id, reviewer, reviewNotes);
      await auditLog({ action: 'vendor-approve', targetId: id, reviewedBy: reviewer, notes: reviewNotes || null });
    } else {
      updated = rejectVendor(id, reviewer, reviewNotes);
      await auditLog({ action: 'vendor-reject', targetId: id, reviewedBy: reviewer, notes: reviewNotes || null });
    }

    if (!updated) return NextResponse.json({ ok: false, error: 'update failed' }, { status: 500 });
    return NextResponse.json({ ok: true, data: { vendor: toPublicVendor(updated) } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
