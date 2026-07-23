import { NextResponse } from 'next/server';
import { listGuests } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const rows = await listGuests(weddingId) as unknown as Array<Record<string, unknown>>;
  const header = ['id','weddingId','name','side','whatsapp','type','maxMembers','rsvpStatus','notes'];
  const csv = [header.join(',')].concat(rows.map(r => header.map(h => (r[h] ?? '').toString().replace(/,/g, '\\,')).join(','))).join('\n');
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="guests${weddingId?'-'+weddingId:''}.csv"` } });
}
