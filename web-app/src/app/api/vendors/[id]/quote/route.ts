import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, createQuoteRequest } from '@/lib/vendorStore';

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
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const mobile = String(body.mobile || '').trim();
    const eventType = String(body.eventType || '').trim();
    const eventDate = String(body.eventDate || '').trim();
    const guestCount = String(body.guestCount || '').trim();
    const budget = String(body.budget || '').trim();
    const message = String(body.message || '').trim();

    if (!name) return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!mobile) return NextResponse.json({ error: 'mobile is required.' }, { status: 400 });

    const quote = createQuoteRequest(id, { name, email, mobile, eventType, eventDate, guestCount, budget, message });
    return NextResponse.json({ ok: true, quoteId: quote.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/vendors/[id]/quote]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
