import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireSuperAdmin } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const url = new URL(req.url);
    const lines = Number(url.searchParams.get('lines') || '20');
    const file = path.join(process.cwd(), 'logs', 'audit.log');
    if (!fs.existsSync(file)) return NextResponse.json({ ok: true, data: { lines: [] } });
    const text = fs.readFileSync(file, 'utf8').trim();
    if (!text) return NextResponse.json({ ok: true, data: { lines: [] } });
    const all = text.split('\n').map(l => { try { return JSON.parse(l); } catch { return { raw: l }; } });
    const tail = all.slice(-lines);
    return NextResponse.json({ ok: true, data: { lines: tail } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
