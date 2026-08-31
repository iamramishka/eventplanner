import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/revenue
// Returns { mrr, total, thisMonth, transactions[] }
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard.response) return guard.response;

  // Count couple users as MRR proxy (9900 LKR/month assumed per couple)
  const MONTHLY_PRICE = 9900;
  const premiumCount = await prisma.user.count({ where: { role: 'COUPLE' } });

  // In future: pull from Stripe. For now compute from couple data.
  const couples = await prisma.user.findMany({
    where: { role: 'COUPLE' },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const transactions = couples.map((c) => ({
    coupleName: c.name || c.email || 'Unknown',
    plan: 'trial',
    amount: 0,
    date: c.createdAt.toISOString().slice(0, 10),
    status: 'registered',
  }));

  return NextResponse.json({
    mrr: premiumCount * MONTHLY_PRICE,
    total: premiumCount * MONTHLY_PRICE,
    thisMonth: 0,
    transactions,
  });
}
