import { NextResponse } from 'next/server';
import { getSubscriptionByEmail } from '@/lib/billingStore';

export async function GET(_: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await params;
    const rec = getSubscriptionByEmail(email);
    if (!rec) return NextResponse.json({ message: 'not_found' }, { status: 404 });
    return NextResponse.json(rec);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
