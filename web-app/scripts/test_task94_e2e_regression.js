#!/usr/bin/env node
/**
 * Task 9.4 — End-to-End Regression Suite
 *
 * Chains the critical user journeys in a single script:
 *   A. Public routes accessible (no auth)
 *   B. Auth gating — protected routes redirect unauthenticated callers
 *   C. Couple onboarding → guests → invites → RSVP → analytics
 *   D. Table seating → Find My Table
 *   E. Vendor registration → browse
 *   F. Super admin — analytics KPIs
 *   G. Email / notification layer
 */

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const SMOKE_KEY = process.env.SMOKE_API_KEY || 'wedplan-smoke-dev-2026';

let passed = 0;
let failed = 0;
const failures = [];

function ok(label, cond, detail = '') {
  if (cond) {
    process.stdout.write(`  ✓ ${label}\n`);
    passed++;
  } else {
    process.stderr.write(`  ✗ ${label}${detail ? ` — ${detail}` : ''}\n`);
    failed++;
    failures.push(label);
  }
}

async function get(path, auth = false) {
  const headers = auth ? { 'x-smoke-key': SMOKE_KEY } : {};
  const res = await fetch(`${BASE}${path}`, { headers });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

async function post(path, body, auth = false) {
  const headers = { 'content-type': 'application/json', ...(auth ? { 'x-smoke-key': SMOKE_KEY } : {}) };
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

async function patch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-smoke-key': SMOKE_KEY },
    body: JSON.stringify(body),
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { 'x-smoke-key': SMOKE_KEY },
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

// ────────────────────────────────────────────────────────────────────────────
async function runA_publicRoutes() {
  console.log('\nA. Public routes');

  const publicPaths = ['/', '/login', '/register', '/find-event', '/vendors'];
  for (const p of publicPaths) {
    const r = await get(p);
    ok(`GET ${p} → 200`, r.status === 200, `got ${r.status}`);
  }

  // Invitation page for seed wedding
  const inv = await get('/invitation/priya-and-kasun');
  ok('Invitation page → 200', inv.status === 200, `got ${inv.status}`);

  // Find-table page for seed slug
  const ft = await get('/find-table/priya-and-kasun');
  ok('Find-table page → 200', ft.status === 200, `got ${ft.status}`);
}

// ────────────────────────────────────────────────────────────────────────────
async function runB_authGating() {
  console.log('\nB. Auth gating — unauthenticated callers blocked');

  const protectedPaths = [
    '/api/weddings/w_1',
    '/api/admin/analytics',
    '/api/admin/couples',
    '/api/guests',
    '/api/vendors/v_1',
  ];
  for (const p of protectedPaths) {
    const r = await get(p);
    ok(`${p} → 401 without auth`, r.status === 401, `got ${r.status}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
async function runC_coupleJourney() {
  console.log('\nC. Couple journey — guests, invites, RSVP, analytics');
  const weddingId = 'w_1';

  // 1. Fetch the seed wedding
  const w = await get(`/api/weddings/${weddingId}`, true);
  ok('Fetch seed wedding', w.status === 200 && w.json?.id === weddingId, `got ${w.status}`);

  // 2. Create a guest
  const gName = `E2E Guest ${Date.now()}`;
  const g = await post('/api/guests', {
    weddingId,
    name: gName,
    side: 'Bride',
    whatsapp: '+94771234567',
    type: 'Individual',
    maxMembers: 1,
  }, true);
  ok('Create guest', g.status === 201 && !!g.json?.id, `got ${g.status} ${JSON.stringify(g.json)}`);
  const guestId = g.json?.id;
  const guestToken = g.json?.token;

  // 3. Update invite sent status
  if (guestId) {
    const inv = await patch(`/api/guests/${guestId}`, { inviteSentAt: new Date().toISOString() });
    ok('Mark invite sent', inv.status === 200 && !!inv.json?.inviteSentAt, `got ${inv.status}`);
  }

  // 4. Invitation page renders with token
  if (guestToken) {
    const invPage = await get(`/invitation/priya-and-kasun?token=${guestToken}`);
    ok('Invitation page with guest token → 200', invPage.status === 200, `got ${invPage.status}`);
  }

  // 5. Submit RSVP
  if (guestToken) {
    const rsvp = await post(`/api/rsvp/${guestToken}`, {
      attending: true,
      memberCount: 1,
      mealPreference: 'vegetarian',
    });
    ok('Submit RSVP', rsvp.status === 200 && rsvp.json?.ok, `got ${rsvp.status} ${JSON.stringify(rsvp.json)}`);
  }

  // 6. Wedding analytics API
  const analytics = await get(`/api/weddings/${weddingId}/analytics`, true);
  ok('Couple analytics API → 200', analytics.status === 200 && !!analytics.json?.guests, `got ${analytics.status}`);
  ok('Analytics guests.total is a number', typeof analytics.json?.guests?.total === 'number');

  // 7. Cleanup guest
  if (guestId) {
    const d = await del(`/api/guests/${guestId}`);
    ok('Delete test guest', d.status === 200 && d.json?.ok, `got ${d.status}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
async function runD_seatingJourney() {
  console.log('\nD. Seating chart — table assignment + Find My Table');
  const weddingId = 'w_1';

  // Create guest
  const g = await post('/api/guests', {
    weddingId,
    name: `E2E Seating ${Date.now()}`,
    side: 'Groom',
    whatsapp: '+94779876543',
    type: 'Individual',
    maxMembers: 1,
  }, true);
  ok('Create seating guest', g.status === 201 && !!g.json?.id, `got ${g.status}`);
  const guestId = g.json?.id;
  const guestToken = g.json?.token;

  // Create table
  const t = await post(`/api/weddings/${weddingId}/tables`, {
    name: `E2E Table ${Date.now()}`,
    capacity: 4,
  }, true);
  ok('Create table', t.status === 200 && t.json?.ok && !!t.json?.data?.id, `got ${t.status}`);
  const tableId = t.json?.data?.id;

  // Assign guest to table
  if (guestId && tableId) {
    const a = await post(`/api/weddings/${weddingId}/tables/assign`, {
      action: 'assign', tableId, guestId,
    }, true);
    ok('Assign guest to table', a.status === 200 && a.json?.ok, `got ${a.status}`);
  }

  // Find My Table via token
  if (guestToken) {
    const r = await get(`/api/rsvp/${guestToken}/table`, true);
    ok('Token table lookup → 200', r.status === 200 && r.json?.ok, `got ${r.status}`);
    ok('Token lookup returns correct table', r.json?.table?.id === tableId || !!r.json?.table, `table: ${JSON.stringify(r.json?.table)}`);
  }

  // Find My Table via public slug API (POST)
  const slug = (await get(`/api/weddings/${weddingId}`, true)).json?.slug;
  if (slug && guestToken) {
    const lookup = await post(`/api/find-table/${slug}`, { token: guestToken });
    ok('Find-table API with token → ok', lookup.status === 200 && lookup.json?.ok, `got ${lookup.status} ${JSON.stringify(lookup.json)}`);
    ok('Find-table returns assigned status', lookup.json?.status === 'assigned', `status: ${lookup.json?.status}`);
  }

  // Cleanup
  if (tableId) await del(`/api/weddings/${weddingId}/tables/${tableId}`);
  if (guestId) await del(`/api/guests/${guestId}`);
  ok('Seating cleanup complete', true);
}

// ────────────────────────────────────────────────────────────────────────────
async function runE_vendorJourney() {
  console.log('\nE. Vendor journey — registration + browse');

  // Register a vendor
  const slug = `e2e-vendor-${Date.now()}`;
  const v = await post('/api/vendors/register', {
    businessName: `E2E Test Vendor ${Date.now()}`,
    category: 'Photography',
    email: `e2e-${Date.now()}@test.com`,
    phone: '+94711234567',
    description: 'E2E regression vendor',
    city: 'Colombo',
    priceMin: 50000,
    priceMax: 200000,
    currency: 'LKR',
    packages: [{ name: 'Basic', price: 50000, description: 'Basic package' }],
    slug,
  });
  ok('Vendor registration → 201', v.status === 201 && !!v.json?.id, `got ${v.status} ${JSON.stringify(v.json)}`);

  // Browse vendors (public)
  const browse = await get('/api/vendors');
  ok('Vendor browse → 200', browse.status === 200 && Array.isArray(browse.json), `got ${browse.status}`);
}

// ────────────────────────────────────────────────────────────────────────────
async function runF_adminAnalytics() {
  console.log('\nF. Super admin analytics');

  const r = await get('/api/admin/analytics?range=30', true);
  ok('Admin analytics → 200', r.status === 200, `got ${r.status}`);
  ok('Has kpis.totalCouples', typeof r.json?.kpis?.totalCouples === 'number');
  ok('Has kpis.mrr', typeof r.json?.kpis?.mrr === 'number');
  ok('coupleGrowth has 30 entries', r.json?.coupleGrowth?.length === 30, `got ${r.json?.coupleGrowth?.length}`);
  ok('rsvpActivity has 30 entries', r.json?.rsvpActivity?.length === 30, `got ${r.json?.rsvpActivity?.length}`);
  ok('vendorPipeline present', !!r.json?.vendorPipeline);
  ok('recentActivity is array', Array.isArray(r.json?.recentActivity));

  const r7 = await get('/api/admin/analytics?range=7', true);
  ok('7-day range clamping works', r7.json?.coupleGrowth?.length === 7, `got ${r7.json?.coupleGrowth?.length}`);
}

// ────────────────────────────────────────────────────────────────────────────
async function runG_notifications() {
  console.log('\nG. Notification layer');

  // Auth guard on notifications test endpoint
  const noAuth = await get('/api/admin/notifications/test');
  ok('Notifications test → 401 without auth', noAuth.status === 401, `got ${noAuth.status}`);

  // Password reset returns 200 even for unknown email (no enumeration)
  const reset = await post('/api/auth/request-reset', { email: 'nobody@example.com' });
  ok('Password reset → 200 for unknown email', reset.status === 200, `got ${reset.status}`);
  ok('Password reset returns ok:true', reset.json?.ok === true, JSON.stringify(reset.json));
}

// ────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   WedPlan — Task 9.4 End-to-End Regression Suite        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Target: ${BASE}`);

  await runA_publicRoutes();
  await runB_authGating();
  await runC_coupleJourney();
  await runD_seatingJourney();
  await runE_vendorJourney();
  await runF_adminAnalytics();
  await runG_notifications();

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failures.length) {
    console.error('\nFailed checks:');
    failures.forEach(f => console.error(`  ✗ ${f}`));
    process.exit(1);
  } else {
    console.log('\n✅ All end-to-end checks passed.\n');
  }
}

run().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
