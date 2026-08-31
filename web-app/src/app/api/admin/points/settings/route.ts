import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getPointSettings, updatePointSettings } from '@/lib/vendorStore';

export async function GET() {
  const guard = await requireRole(['SUPER_ADMIN']);
  if (guard.response) return guard.response;

  return NextResponse.json({ settings: getPointSettings() });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireRole(['SUPER_ADMIN']);
  if (guard.response) return guard.response;

  try {
    const body = await req.json();
    const pointsPerUnlock = Number(body.pointsPerUnlock);
    if (!Number.isFinite(pointsPerUnlock) || !Number.isInteger(pointsPerUnlock) || pointsPerUnlock < 1 || pointsPerUnlock > 100) {
      return NextResponse.json({ error: 'pointsPerUnlock must be a positive number.' }, { status: 400 });
    }
    const updated = updatePointSettings({ pointsPerUnlock });
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err) {
    console.error('[PATCH /api/admin/points/settings]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
