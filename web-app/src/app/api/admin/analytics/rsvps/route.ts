import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/rsvps
// Returns { date: string, count: number }[] for the last 30 days (YYYY-MM-DD)
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard.response) return guard.response;

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const counts = await Promise.all(
    days.map(async (day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = await prisma.guestRsvp.count({
        where: { updatedAt: { gte: day, lt: next } },
      });
      return { date: day.toISOString().slice(0, 10), count };
    })
  );

  return NextResponse.json(counts);
}
