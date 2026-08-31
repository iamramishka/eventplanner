import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/onboarding
// Returns onboarding funnel steps with count and percentage relative to total couples.
export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard.response) return guard.response;

  const totalCouples = await prisma.user.count({ where: { role: 'COUPLE' } });

  const setupCompleted = await prisma.wedding.count({
    where: { setupCompleted: true },
  });

  const hasGuests = await prisma.wedding.count({
    where: { guests: { some: {} } },
  });

  const hasRsvp = await prisma.wedding.count({
    where: { guests: { some: { rsvp: { isNot: null } } } },
  });

  const hasBudget = await prisma.wedding.count({
    where: { budgetItems: { some: {} } },
  });

  const hasChecklist = await prisma.wedding.count({
    where: { checklistItems: { some: {} } },
  });

  const pct = (n: number): number =>
    totalCouples === 0 ? 0 : Math.round((n / totalCouples) * 100);

  return NextResponse.json([
    { step: 'Registered', count: totalCouples, pct: 100 },
    { step: 'Completed Setup', count: setupCompleted, pct: pct(setupCompleted) },
    { step: 'Added Guests', count: hasGuests, pct: pct(hasGuests) },
    { step: 'Has RSVP Response', count: hasRsvp, pct: pct(hasRsvp) },
    { step: 'Using Budget', count: hasBudget, pct: pct(hasBudget) },
    { step: 'Using Checklist', count: hasChecklist, pct: pct(hasChecklist) },
  ]);
}
