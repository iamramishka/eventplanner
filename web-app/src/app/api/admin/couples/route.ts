import { NextResponse } from 'next/server';
import { getAdminCouples } from '@/lib/adminCouples';
import { requireSuperAdmin } from '@/lib/rbac';

export async function GET() {
  const access = await requireSuperAdmin();
  if (access.response) return access.response;
  return NextResponse.json({ ok: true, data: { couples: getAdminCouples() } });
}
