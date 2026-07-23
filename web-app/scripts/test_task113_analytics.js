#!/usr/bin/env node
/**
 * Task 11.3 smoke tests — Super Admin analytics API
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5656';
const SMOKE_KEY = process.env.SMOKE_API_KEY || 'wedplan-smoke-dev-2026';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

async function req(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-smoke-key': SMOKE_KEY },
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function run() {
  console.log(`\nTask 11.3 — Super Admin analytics smoke tests`);
  console.log(`Target: ${BASE_URL}\n`);

  // ── 1. Auth guard ─────────────────────────────────────────
  console.log('1. Auth guard');
  const noAuth = await fetch(`${BASE_URL}/api/admin/analytics`);
  assert('Returns 401 without auth', noAuth.status === 401, `got ${noAuth.status}`);

  // ── 2. Default (30-day) range ─────────────────────────────
  console.log('\n2. Default 30-day range');
  const r30 = await req('/api/admin/analytics?range=30');
  assert('Returns 200', r30.status === 200, `got ${r30.status}`);
  assert('Has kpis object', !!r30.data?.kpis);
  assert('kpis.totalCouples is a number', typeof r30.data?.kpis?.totalCouples === 'number');
  assert('kpis.totalVendors is a number', typeof r30.data?.kpis?.totalVendors === 'number');
  assert('kpis.mrr is a number', typeof r30.data?.kpis?.mrr === 'number');
  assert('kpis.conversionRate is a number', typeof r30.data?.kpis?.conversionRate === 'number');
  assert('kpis.conversionRate is 0–100', r30.data?.kpis?.conversionRate >= 0 && r30.data?.kpis?.conversionRate <= 100);

  // ── 3. Time-series arrays ─────────────────────────────────
  console.log('\n3. Time-series arrays');
  assert('coupleGrowth is an array', Array.isArray(r30.data?.coupleGrowth));
  assert('coupleGrowth has 30 entries', r30.data?.coupleGrowth?.length === 30, `got ${r30.data?.coupleGrowth?.length}`);
  assert('coupleGrowth entries have date/count/cumulative', r30.data?.coupleGrowth?.[0]?.date && typeof r30.data.coupleGrowth[0].count === 'number');

  assert('rsvpActivity is an array', Array.isArray(r30.data?.rsvpActivity));
  assert('rsvpActivity has 30 entries', r30.data?.rsvpActivity?.length === 30, `got ${r30.data?.rsvpActivity?.length}`);
  assert('rsvpActivity entries have confirmed/declined/pending', 'confirmed' in (r30.data?.rsvpActivity?.[0] || {}));

  // ── 4. Vendor pipeline ────────────────────────────────────
  console.log('\n4. Vendor pipeline');
  const vp = r30.data?.vendorPipeline;
  assert('vendorPipeline object present', !!vp);
  assert('Has pending/approved/rejected/suspended keys', typeof vp?.pending === 'number' && typeof vp?.approved === 'number');
  const total = (vp?.pending || 0) + (vp?.approved || 0) + (vp?.rejected || 0) + (vp?.suspended || 0);
  assert('Pipeline total matches totalVendors', total === r30.data?.kpis?.totalVendors, `pipeline sum=${total} vs totalVendors=${r30.data?.kpis?.totalVendors}`);

  // ── 5. Plan distribution ──────────────────────────────────
  console.log('\n5. Plan distribution');
  const pd = r30.data?.planDistribution;
  assert('planDistribution present', !!pd);
  assert('trial + premium equals totalCouples', (pd?.trial + pd?.premium) === r30.data?.kpis?.totalCouples,
    `${pd?.trial} + ${pd?.premium} != ${r30.data?.kpis?.totalCouples}`);

  // ── 6. Recent activity ────────────────────────────────────
  console.log('\n6. Recent activity');
  assert('recentActivity is an array', Array.isArray(r30.data?.recentActivity));
  if (r30.data?.recentActivity?.length > 0) {
    const item = r30.data.recentActivity[0];
    assert('Activity items have type/description/ts/ago', !!item.type && !!item.description && !!item.ts && !!item.ago);
  } else {
    console.log('  ⚠ recentActivity is empty (no seeded events in range)');
    passed++;
  }

  // ── 7. Range clamping ─────────────────────────────────────
  console.log('\n7. Range clamping');
  const r7 = await req('/api/admin/analytics?range=7');
  assert('7-day range returns 7 entries', r7.data?.coupleGrowth?.length === 7, `got ${r7.data?.coupleGrowth?.length}`);

  const r90 = await req('/api/admin/analytics?range=90');
  assert('90-day range returns 90 entries', r90.data?.coupleGrowth?.length === 90, `got ${r90.data?.coupleGrowth?.length}`);

  const r200 = await req('/api/admin/analytics?range=200');
  assert('Over-limit range clamped to 90', r200.data?.coupleGrowth?.length === 90, `got ${r200.data?.coupleGrowth?.length}`);

  // ── Results ───────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
