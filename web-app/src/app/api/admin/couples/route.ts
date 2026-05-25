import { NextResponse } from 'next/server';
import { getAdminCouples } from '@/lib/adminCouples';
import { requireSuperAdmin } from '@/lib/adminAuth';

export async function GET() {
  const forbidden = await requireSuperAdmin();
  if (forbidden) return forbidden;
  return NextResponse.json({ ok: true, data: { couples: getAdminCouples() } });
}
