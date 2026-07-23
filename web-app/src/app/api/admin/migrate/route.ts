import { NextResponse } from 'next/server';

const MIGRATION_SQL = `
ALTER TABLE "Wedding"
  ADD COLUMN IF NOT EXISTS "eventTime" text,
  ADD COLUMN IF NOT EXISTS "venueAddress" text,
  ADD COLUMN IF NOT EXISTS "venueMapLink" text,
  ADD COLUMN IF NOT EXISTS "rsvpDeadline" date,
  ADD COLUMN IF NOT EXISTS "specialNoteText" text;
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('key') !== 'wp-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
  }

  // Extract project ref from URL: https://{ref}.supabase.co
  const ref = supabaseUrl.replace('https://', '').split('.')[0];

  // Supabase Management API — runs arbitrary SQL against the project DB
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: MIGRATION_SQL }),
  });

  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = text; }

  if (!res.ok) {
    return NextResponse.json({ ok: false, status: res.status, body: json }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: 'Migration complete — all 5 columns added.', body: json });
}
