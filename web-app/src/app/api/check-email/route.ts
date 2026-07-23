import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get('email') || '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ exists: false });
  }
  const rows = await dbSelect<{ id: string }>('User', { email: `eq.${email.toLowerCase()}` }, 'id', 1);
  return NextResponse.json({ exists: rows.length > 0 });
}
