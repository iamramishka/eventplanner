/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/rbac';
import { getAdminCouples } from '@/lib/adminCouples';
import { getAllVendors } from '@/lib/vendorStore';
import { db } from '@/lib/store';
import { getAdminSettings } from '@/lib/adminSettings';

// GET /api/admin/analytics?range=30
export async function GET(req: NextRequest) {
  const guard = await requireSuperAdmin();
  if (guard.response) return guard.response;

  const url = new URL(req.url);
  const range = Math.min(Math.max(Number(url.searchParams.get('range') || '30'), 7), 90);

  const couples = getAdminCouples();
  const vendors = getAllVendors();
  const rsvps = db.rsvps.findMany(() => true);
  const guests = db.guests.findMany(() => true);

  // ── Plan pricing for MRR ─────────────────────────────────────
  const settings = getAdminSettings();
  const premiumPlan = settings.plans?.find((p: any) => p.id === 'premium');
  const premiumPrice = Number(premiumPlan?.price?.replace?.(/[^0-9.]/g, '') || 2990);

  // ── KPIs ─────────────────────────────────────────────────────
  const now = new Date();
  const premiumCouples = couples.filter((c: any) => c.plan === 'premium');
  const trialCouples = couples.filter((c: any) => c.plan !== 'premium');
  const trialActive = trialCouples.filter((c: any) => !c.trialEnds || new Date(c.trialEnds) >= now);
  const trialExpired = trialCouples.filter((c: any) => c.trialEnds && new Date(c.trialEnds) < now);
  const mrr = premiumCouples.length * premiumPrice;
  const conversionRate = couples.length > 0
    ? Math.round((premiumCouples.length / couples.length) * 100)
    : 0;

  const vendorPipeline = {
    pending: vendors.filter((v: any) => v.status === 'pending_review').length,
    approved: vendors.filter((v: any) => v.status === 'approved' || v.status === 'live').length,
    rejected: vendors.filter((v: any) => v.status === 'rejected').length,
    suspended: vendors.filter((v: any) => v.status === 'suspended').length,
  };

  const confirmedRsvps = rsvps.filter((r: any) => r.status === 'confirmed' || r.status === 'CONFIRMED').length;
  const declinedRsvps = rsvps.filter((r: any) => r.status === 'declined' || r.status === 'DECLINED').length;

  // ── Time series helpers ───────────────────────────────────────
  const rangeStart = new Date(now);
  rangeStart.setDate(now.getDate() - range);
  rangeStart.setHours(0, 0, 0, 0);

  function toDateStr(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  function buildDayBuckets(): Record<string, number> {
    const buckets: Record<string, number> = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      buckets[toDateStr(d)] = 0;
    }
    return buckets;
  }

  // ── Couple growth ─────────────────────────────────────────────
  const growthBuckets = buildDayBuckets();
  for (const c of couples) {
    const d = c.createdAt ? toDateStr(new Date(c.createdAt)) : null;
    if (d && d in growthBuckets) growthBuckets[d]++;
  }
  let cumulative = couples.filter((c: any) => {
    const d = c.createdAt ? new Date(c.createdAt) : null;
    return d && d < rangeStart;
  }).length;

  const coupleGrowth = Object.entries(growthBuckets).map(([date, count]) => {
    cumulative += count;
    return { date, count, cumulative };
  });

  // ── RSVP activity ─────────────────────────────────────────────
  const rsvpBuckets: Record<string, { confirmed: number; declined: number; pending: number }> = {};
  for (const d of Object.keys(buildDayBuckets())) {
    rsvpBuckets[d] = { confirmed: 0, declined: 0, pending: 0 };
  }
  for (const r of rsvps) {
    const d = r.updatedAt ? toDateStr(new Date(r.updatedAt)) : null;
    if (!d || !(d in rsvpBuckets)) continue;
    const st = (r.status || '').toLowerCase();
    if (st === 'confirmed') rsvpBuckets[d].confirmed++;
    else if (st === 'declined') rsvpBuckets[d].declined++;
    else rsvpBuckets[d].pending++;
  }
  const rsvpActivity = Object.entries(rsvpBuckets).map(([date, v]) => ({ date, ...v }));

  // ── Recent activity feed ──────────────────────────────────────
  const events: Array<{ type: string; description: string; ts: string }> = [];

  for (const c of couples) {
    if (c.createdAt) events.push({ type: 'couple_registered', description: `${c.name} registered`, ts: c.createdAt });
  }
  for (const v of vendors) {
    if (v.createdAt) {
      const statusLabel = v.status === 'pending_review' ? 'pending review' : v.status;
      events.push({ type: 'vendor_' + v.status, description: `${v.businessName} — ${statusLabel}`, ts: v.createdAt });
    }
  }

  events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  const recentActivity = events.slice(0, 15).map(e => ({
    ...e,
    ago: formatAgo(new Date(e.ts), now),
  }));

  return NextResponse.json({
    range,
    kpis: {
      totalCouples: couples.length,
      totalVendors: vendors.length,
      totalGuests: guests.length,
      totalRsvps: rsvps.length,
      confirmedRsvps,
      declinedRsvps,
      premiumCouples: premiumCouples.length,
      trialCouples: trialCouples.length,
      trialActive: trialActive.length,
      trialExpired: trialExpired.length,
      mrr,
      conversionRate,
      premiumPrice,
    },
    vendorPipeline,
    planDistribution: { trial: trialCouples.length, premium: premiumCouples.length },
    coupleGrowth,
    rsvpActivity,
    recentActivity,
  });
}

function formatAgo(from: Date, now: Date): string {
  const secs = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}
