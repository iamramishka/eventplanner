import { NextResponse } from 'next/server';
import { findCleanupCandidates, performCleanup, generateConfirmationToken } from '@/lib/cleanup';
import { requireSuperAdmin } from '@/lib/rbac';
import { auditLog } from '@/lib/audit';

let pendingToken: string | null = null;

function cleanRetentionDays(value: unknown) {
  const numeric = Number(value ?? 30);
  if (!Number.isFinite(numeric)) return 30;
  return Math.min(3650, Math.max(1, Math.floor(numeric)));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(req: Request) {
  const access = await requireSuperAdmin();
  if (access.response) return access.response;
  const url = new URL(req.url);
  const days = cleanRetentionDays(url.searchParams.get('retentionDays'));
  const candidates = findCleanupCandidates(days);
  const token = generateConfirmationToken();
  pendingToken = token;
  return NextResponse.json({ summary: { weddings: candidates.weddings.length, guests: candidates.guests.length, rsvps: candidates.rsvps.length }, confirmationToken: token });
}

export async function POST(req: Request) {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const body = await req.json();
    const action = body?.action || 'dry-run';
    const retentionDays = cleanRetentionDays(body?.retentionDays);

    if (action === 'dry-run') {
      const report = performCleanup({ retentionDays, dryRun: true });
      return NextResponse.json(report);
    }

    const token = body?.token;
    const force = !!body?.force;
    if (!token || token !== pendingToken) return NextResponse.json({ ok: false, error: 'invalid or missing confirmation token' }, { status: 400 });
    if (!force) {
      const report = performCleanup({ retentionDays, dryRun: false, force: false });
      return NextResponse.json(report);
    }

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
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
