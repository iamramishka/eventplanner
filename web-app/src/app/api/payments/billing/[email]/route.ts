import { NextResponse } from 'next/server';
import { getSubscriptionByEmail } from '../../../../lib/billingStore';

export async function GET(req: Request, { params }: { params: { email: string } }) {
  try {
    const email = params.email;
    const rec = getSubscriptionByEmail(email);
    if (!rec) return NextResponse.json({ message: 'not_found' }, { status: 404 });
    return NextResponse.json(rec);
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
