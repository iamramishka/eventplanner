import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let restResult = '';
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/User?select=id&limit=1`, {
      headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` },
    });
    const body = await res.json();
    restResult = `status:${res.status} body:${JSON.stringify(body).slice(0, 100)}`;
  } catch (e: unknown) {
    restResult = 'ERR: ' + (e instanceof Error ? e.message : String(e));
  }

  return NextResponse.json({
    supabaseUrl: supabaseUrl.slice(0, 40) + '...',
    hasSvcKey: svcKey.length > 20,
    restResult,
  });
}
