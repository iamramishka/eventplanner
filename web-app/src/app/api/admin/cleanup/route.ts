import { NextResponse } from 'next/server';
import { findCleanupCandidates, performCleanup, generateConfirmationToken } from '@/lib/cleanup';
import { requireSuperAdmin } from '@/lib/adminAuth';
import { auditLog } from '@/lib/audit';

let pendingToken: string | null = null;

function cleanRetentionDays(value: unknown) {
  const numeric = Number(value ?? 30);
  if (!Number.isFinite(numeric)) return 30;
  return Math.min(3650, Math.max(1, Math.floor(numeric)));
}

export async function GET(req: Request) {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  // return dry-run summary and a confirmation token (single-use)
  const url = new URL(req.url);
  const days = cleanRetentionDays(url.searchParams.get('retentionDays'));
  const candidates = findCleanupCandidates(days);
  const token = generateConfirmationToken();
  pendingToken = token;
  return NextResponse.json({ summary: { weddings: candidates.weddings.length, guests: candidates.guests.length, rsvps: candidates.rsvps.length }, confirmationToken: token });
}

export async function POST(req: Request) {
  try {
    const forbidden = await requireSuperAdmin();
    if (forbidden) return forbidden;
    const body = await req.json();
    const action = body?.action || 'dry-run';
    const retentionDays = cleanRetentionDays(body?.retentionDays);

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
    await auditLog({
      action: 'admin-cleanup-executed',
      retentionDays,
      deletedGuests: report.deleted?.guests?.length || 0,
      deletedRsvps: report.deleted?.rsvps?.length || 0,
      weddingsMarked: report.weddingCount || 0,
    });
    return NextResponse.json(report);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
