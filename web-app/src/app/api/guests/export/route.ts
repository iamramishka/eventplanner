import { NextResponse } from 'next/server';
import { exportGuests } from '@/lib/store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  const rows = exportGuests(weddingId);
  const header = ['id','weddingId','name','side','whatsapp','type','maxMembers','rsvpStatus','notes'];
  const csv = [header.join(',')].concat(rows.map(r => header.map(h => (r[h] ?? '').toString().replace(/,/g, '\\,')).join(','))).join('\n');
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="guests${weddingId?'-'+weddingId:''}.csv"` } });
}
