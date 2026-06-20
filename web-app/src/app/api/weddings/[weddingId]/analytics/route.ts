import { NextResponse } from 'next/server';
import { requireWeddingAccess } from '@/lib/rbac';
import { db } from '@/lib/store';

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;

  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });

  const guests: any[] = db.guests.findMany((g: any) => g.weddingId === weddingId);
  const rsvps: any[]  = db.rsvps.findMany((r: any) => r.weddingId === weddingId);
  const budget: any[] = db.budget.findMany((b: any) => b.weddingId === weddingId);
  const checklist: any[] = db.checklist.findMany((c: any) => c.weddingId === weddingId);

  // ── RSVP Funnel ──────────────────────────────────────────────
  const totalGuests  = guests.length;
  const responded    = rsvps.length;
  const confirmed    = rsvps.filter((r: any) => r.attending === true).length;
  const declined     = rsvps.filter((r: any) => r.attending === false).length;
  const noResponse   = totalGuests - responded;
  const responseRate = totalGuests > 0 ? Math.round((responded / totalGuests) * 100) : 0;
  const confirmRate  = totalGuests > 0 ? Math.round((confirmed / totalGuests) * 100) : 0;
  const declineRate  = totalGuests > 0 ? Math.round((declined / totalGuests) * 100) : 0;

  // ── Attendance ────────────────────────────────────────────────
  const totalExpected = rsvps
    .filter((r: any) => r.attending)
    .reduce((s: number, r: any) => s + (Number(r.memberCount) || 1), 0);

  const brideConfirmed = rsvps.filter((r: any) => {
    const g = guests.find((g: any) => g.id === r.guestId);
    return r.attending && g?.side?.toLowerCase().includes('bride');
  }).reduce((s: number, r: any) => s + (Number(r.memberCount) || 1), 0);

  const groomConfirmed = rsvps.filter((r: any) => {
    const g = guests.find((g: any) => g.id === r.guestId);
    return r.attending && g?.side?.toLowerCase().includes('groom');
  }).reduce((s: number, r: any) => s + (Number(r.memberCount) || 1), 0);

  // Meal & liquor preferences from confirmed guests
  const mealPrefs: Record<string, number> = {};
  const liquorPrefs: Record<string, number> = {};
  for (const r of rsvps) {
    if (!r.attending) continue;
    if (r.mealPreference) mealPrefs[r.mealPreference] = (mealPrefs[r.mealPreference] || 0) + (Number(r.memberCount) || 1);
    if (r.liquorPreference) liquorPrefs[r.liquorPreference] = (liquorPrefs[r.liquorPreference] || 0) + (Number(r.memberCount) || 1);
  }

  // Side breakdown for all guests
  const brideSide = guests.filter((g: any) => g.side?.toLowerCase().includes('bride')).length;
  const groomSide = guests.filter((g: any) => g.side?.toLowerCase().includes('groom')).length;

  // ── RSVP Timeline (last 60 days) ─────────────────────────────
  const now = new Date();
  const buckets: Record<string, { confirmed: number; declined: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = { confirmed: 0, declined: 0 };
  }
  for (const r of rsvps) {
    const d = r.updatedAt ? r.updatedAt.slice(0, 10) : null;
    if (d && d in buckets) {
      if (r.attending) buckets[d].confirmed++;
      else buckets[d].declined++;
    }
  }
  const rsvpTimeline = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));

  // ── Budget ────────────────────────────────────────────────────
  const budgetPaid      = budget.reduce((s: number, b: any) => s + (Number(b.actual) || 0), 0);
  const budgetEstimated = budget.reduce((s: number, b: any) => s + (Number(b.estimated) || 0), 0);
  const budgetReserved  = budget.filter((b: any) => b.status === 'reserved').reduce((s: number, b: any) => s + (Number(b.estimated) || 0), 0);
  const budgetPlanned   = budget.filter((b: any) => b.status === 'planned').reduce((s: number, b: any) => s + (Number(b.estimated) || 0), 0);
  const budgetPaidCount = budget.filter((b: any) => b.status === 'paid').length;

  // Category breakdown
  const catMap: Record<string, { estimated: number; actual: number }> = {};
  for (const b of budget) {
    const cat = b.category || 'Other';
    if (!catMap[cat]) catMap[cat] = { estimated: 0, actual: 0 };
    catMap[cat].estimated += Number(b.estimated) || 0;
    catMap[cat].actual    += Number(b.actual)    || 0;
  }
  const budgetCategories = Object.entries(catMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.estimated - a.estimated)
    .slice(0, 8);

  // ── Checklist ─────────────────────────────────────────────────
  const clTotal     = checklist.length;
  const clCompleted = checklist.filter((c: any) => c.isCompleted).length;
  const today       = new Date(); today.setHours(0, 0, 0, 0);
  const clOverdue   = checklist.filter((c: any) => !c.isCompleted && c.dueDate && new Date(c.dueDate + 'T00:00:00') < today).length;
  const in7         = new Date(today); in7.setDate(today.getDate() + 7);
  const clDueSoon   = checklist.filter((c: any) => !c.isCompleted && c.dueDate && new Date(c.dueDate + 'T00:00:00') >= today && new Date(c.dueDate + 'T00:00:00') <= in7).length;

  const groupMap: Record<string, { total: number; completed: number }> = {};
  for (const c of checklist) {
    const g = c.group || 'General';
    if (!groupMap[g]) groupMap[g] = { total: 0, completed: 0 };
    groupMap[g].total++;
    if (c.isCompleted) groupMap[g].completed++;
  }
  const checklistByGroup = Object.entries(groupMap).map(([group, v]) => ({ group, ...v }));

  // ── Countdown ────────────────────────────────────────────────
  const eventDate = wedding.date || wedding.eventDate || null;
  let daysUntil: number | null = null;
  if (eventDate) {
    const ev = new Date(eventDate); ev.setHours(0, 0, 0, 0);
    const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
    daysUntil = Math.ceil((ev.getTime() - todayMid.getTime()) / 86400000);
  }

  return NextResponse.json({
    guests: {
      total: totalGuests,
      responded,
      confirmed,
      declined,
      noResponse,
      responseRate,
      confirmRate,
      declineRate,
      brideSide,
      groomSide,
    },
    attendance: {
      totalExpected,
      brideConfirmed,
      groomConfirmed,
      mealPrefs,
      liquorPrefs,
    },
    rsvpTimeline,
    budget: {
      total: budgetEstimated,
      paid: budgetPaid,
      reserved: budgetReserved,
      planned: budgetPlanned,
      remaining: Math.max(0, budgetEstimated - budgetPaid - budgetReserved),
      paidPct: budgetEstimated > 0 ? Math.round((budgetPaid / budgetEstimated) * 100) : 0,
      itemCount: budget.length,
      paidCount: budgetPaidCount,
      categories: budgetCategories,
    },
    checklist: {
      total: clTotal,
      completed: clCompleted,
      pending: clTotal - clCompleted - clOverdue,
      overdue: clOverdue,
      dueSoon: clDueSoon,
      completionPct: clTotal > 0 ? Math.round((clCompleted / clTotal) * 100) : 0,
      byGroup: checklistByGroup,
    },
    countdown: { daysUntil, eventDate },
  });
}
