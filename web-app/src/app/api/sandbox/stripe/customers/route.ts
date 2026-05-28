import { NextResponse } from 'next/server';
import { createMockCustomer } from '../../../../../lib/sandboxStripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email || null;
    const customer = createMockCustomer(email);
    return NextResponse.json(customer);
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
