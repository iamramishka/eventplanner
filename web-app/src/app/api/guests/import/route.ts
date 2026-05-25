import { NextResponse } from 'next/server';
import { importGuests } from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Array<Record<string,string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const obj: Record<string,string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (parts[j] || '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const rows = parseCsv(text);
    const weddingId = rows[0]?.weddingId || rows[0]?.weddingid || rows[0]?.wedding || '';
    if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(weddingId));
    if (access.response) return access.response;
    const created = importGuests(rows as any);
    return NextResponse.json({ ok: true, createdCount: created.length, created });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
