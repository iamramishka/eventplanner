import { NextResponse } from 'next/server';
import { createMockCheckoutSession } from '../../../../../lib/sandboxStripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const priceId = body?.priceId || null;
    const customerEmail = body?.customerEmail || null;
    const session = createMockCheckoutSession(priceId, customerEmail);
    return NextResponse.json(session);
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
