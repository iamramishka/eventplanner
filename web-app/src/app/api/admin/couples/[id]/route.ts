import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import { deleteAdminCouple, updateAdminCouple } from '@/lib/adminCouples';
import { requireSuperAdmin } from '@/lib/adminAuth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const { id } = await params;
    const body = await req.json();
    const updated = updateAdminCouple(id, body);
    if (!updated) return NextResponse.json({ ok: false, error: 'couple not found' }, { status: 404 });

    await auditLog({
      action: 'patch-couple',
      targetId: id,
      data: {
        name: updated.name,
        email: updated.email,
        plan: updated.plan,
        trialEnds: updated.trialEnds || null,
        suspended: updated.suspended,
        billingState: updated.billingState || null,
      },
    });
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const { id } = await params;
    const removed = deleteAdminCouple(id);
    if (!removed) return NextResponse.json({ ok: false, error: 'couple not found' }, { status: 404 });

    await auditLog({ action: 'delete-couple', targetId: id, data: { name: removed.name, email: removed.email } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
