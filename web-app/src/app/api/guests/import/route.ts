import { NextResponse } from 'next/server';
import { importGuestRows } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

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
    const created = await importGuestRows(rows);
    return NextResponse.json({ ok: true, createdCount: created.length, created });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
