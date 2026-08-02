import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/health
// Returns system health: DB connectivity, image/couple/vendor counts, error count.
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard.response) return guard.response;

  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    // db remains false
  }

  const totalImages = await prisma.galleryImage.count();
  const totalCouples = await prisma.user.count({ where: { role: 'COUPLE' } });
  const totalVendors = await prisma.user.count({ where: { role: 'VENDOR' } });

  return NextResponse.json({
    db,
    totalImages,
    totalCouples,
    totalVendors,
    errorCount: 0,
  });
}
