import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getVendorById, createMessageThread } from '@/lib/vendorStore';

export async function POST(req: NextRequest) {
  const guard = await requireRole(['COUPLE', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  try {
    const body = await req.json();
    const vendorId = String(body.vendorId || '').trim();
    const message = String(body.message || '').trim();
    const coupleName = String(body.coupleName || 'A Couple').trim();

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required.' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'message is required.' }, { status: 400 });
    }
    if (!getVendorById(vendorId)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const weddingDate = body.weddingDate ? String(body.weddingDate).trim() : undefined;
    const guestCount = body.guestCount ? String(body.guestCount).trim() : undefined;
    const packageName = body.packageName ? String(body.packageName).trim() : '';
    const subject = packageName
      ? `Enquiry for ${packageName} — ${coupleName}`
      : `Quote enquiry from ${coupleName}`;

    const thread = createMessageThread(vendorId, coupleName, subject, message, { weddingDate, guestCount, packageName });

    return NextResponse.json({ ok: true, threadId: thread.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/messages/quote]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
