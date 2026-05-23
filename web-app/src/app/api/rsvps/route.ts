import { NextResponse } from 'next/server';
import { db, addRsvp } from '@/lib/store';
import { auditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const weddingId = url.searchParams.get('weddingId') || undefined;
  const rows = weddingId ? db.rsvps.findMany(r => r.weddingId === weddingId) : db.rsvps.findMany(() => true);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addRsvp({
      ...body,
      attending: body.status === 'confirmed',
      memberCount: body.attendingCount
    });
    await auditLog({ action: 'create-rsvp', targetId: created.id, data: body });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
