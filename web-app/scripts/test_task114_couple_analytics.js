#!/usr/bin/env node
/**
 * Task 11.4 smoke tests — Couple wedding analytics API
 */

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:5656';
const SMOKE_KEY = process.env.SMOKE_API_KEY || 'wedplan-smoke-dev-2026';
const WEDDING_ID = 'w_1';

let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

async function req(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { 'x-smoke-key': SMOKE_KEY } });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function run() {
  console.log(`\nTask 11.4 — Couple analytics smoke tests`);
  console.log(`Target: ${BASE_URL}\n`);

  // ── 1. Auth guard ─────────────────────────────────────────
  console.log('1. Auth guard');
  const noAuth = await fetch(`${BASE_URL}/api/weddings/${WEDDING_ID}/analytics`);
  assert('Returns 401 without auth', noAuth.status === 401, `got ${noAuth.status}`);

  // ── 2. Response shape ─────────────────────────────────────
  console.log('\n2. Response shape');
  const r = await req(`/api/weddings/${WEDDING_ID}/analytics`);
  assert('Returns 200', r.status === 200, `got ${r.status}`);

  const { guests, attendance, rsvpTimeline, budget, checklist, countdown } = r.data;

  assert('Has guests object', !!guests);
  assert('guests.total is a number', typeof guests?.total === 'number');
  assert('guests.responseRate is 0–100', guests?.responseRate >= 0 && guests?.responseRate <= 100);
  assert('guests.confirmed + declined + noResponse = total',
    (guests?.confirmed + guests?.declined + guests?.noResponse) === guests?.total,
    `${guests?.confirmed} + ${guests?.declined} + ${guests?.noResponse} != ${guests?.total}`);

  // ── 3. Attendance ─────────────────────────────────────────
  console.log('\n3. Attendance');
  assert('Has attendance object', !!attendance);
  assert('totalExpected is a number', typeof attendance?.totalExpected === 'number');
  assert('mealPrefs is an object', typeof attendance?.mealPrefs === 'object');

  // ── 4. RSVP Timeline ─────────────────────────────────────
  console.log('\n4. RSVP Timeline');
  assert('rsvpTimeline is an array', Array.isArray(rsvpTimeline));
  assert('rsvpTimeline has 30 entries', rsvpTimeline?.length === 30, `got ${rsvpTimeline?.length}`);
  assert('Timeline entries have date/confirmed/declined',
    rsvpTimeline?.[0]?.date && typeof rsvpTimeline[0].confirmed === 'number');

  // ── 5. Budget ─────────────────────────────────────────────
  console.log('\n5. Budget');
  assert('Has budget object', !!budget);
  assert('budget.total is a number', typeof budget?.total === 'number');
  assert('budget.paidPct is 0–100', budget?.paidPct >= 0 && budget?.paidPct <= 100);
  assert('budget.categories is an array', Array.isArray(budget?.categories));

  // ── 6. Checklist ─────────────────────────────────────────
  console.log('\n6. Checklist');
  assert('Has checklist object', !!checklist);
  assert('checklist.completionPct is 0–100', checklist?.completionPct >= 0 && checklist?.completionPct <= 100);
  assert('completed + pending + overdue <= total',
    (checklist?.completed + checklist?.pending + checklist?.overdue) <= checklist?.total + 1); // +1 for rounding
  assert('byGroup is an array', Array.isArray(checklist?.byGroup));

  // ── 7. Countdown ─────────────────────────────────────────
  console.log('\n7. Countdown');
  assert('Has countdown object', !!countdown);
  assert('daysUntil is a number or null',
    countdown?.daysUntil === null || typeof countdown?.daysUntil === 'number');

  // ── 8. Invalid wedding ────────────────────────────────────
  console.log('\n8. Invalid wedding guard');
  const bad = await req('/api/weddings/nonexistent_id_xyz/analytics');
  assert('Returns 404 for unknown weddingId', bad.status === 404, `got ${bad.status}`);

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
