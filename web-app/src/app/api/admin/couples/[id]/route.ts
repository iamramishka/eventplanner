import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    // For MVP we don't have a persistent couples store server-side; record audit and return body back
    await auditLog({ action: 'patch-couple', targetId: id, data: body });
    return NextResponse.json({ ok: true, updated: body });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await auditLog({ action: 'delete-couple', targetId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
