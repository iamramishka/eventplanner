import { NextResponse } from 'next/server';
import { findCleanupCandidates, performCleanup, generateConfirmationToken } from '@/lib/cleanup';

let pendingToken: string | null = null;

export async function GET(req: Request) {
  // return dry-run summary and a confirmation token (single-use)
  const url = new URL(req.url);
  const days = Number(url.searchParams.get('retentionDays') || '30');
  const candidates = findCleanupCandidates(days);
  const token = generateConfirmationToken();
  pendingToken = token;
  return NextResponse.json({ summary: { weddings: candidates.weddings.length, guests: candidates.guests.length, rsvps: candidates.rsvps.length }, confirmationToken: token });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action || 'dry-run';
    const retentionDays = Number(body?.retentionDays || 30);

    if (action === 'dry-run') {
      const report = performCleanup({ retentionDays, dryRun: true });
      return NextResponse.json(report);
    }

    // execute requires token and force
    const token = body?.token;
    const force = !!body?.force;
    if (!token || token !== pendingToken) return NextResponse.json({ ok: false, error: 'invalid or missing confirmation token' }, { status: 400 });
    if (!force) {
      // do not consume token on validation failure
      const report = performCleanup({ retentionDays, dryRun: false, force: false });
      return NextResponse.json(report);
    }
    // consume token only when actually executing
    pendingToken = null;
    const report = performCleanup({ retentionDays, dryRun: false, force: true });
    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
