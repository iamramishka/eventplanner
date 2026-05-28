#!/usr/bin/env node
// scripts/test_task92_plans.js
// Smoke tests for Task 9.2 — Super Admin plan and subscription management
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/test_task92_plans.js

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

let passed = 0;
let failed = 0;

function ok(label, cond, extra = '') {
  if (cond) { console.log(`  ✅ ${label}`); passed++; }
  else { console.error(`  ❌ ${label}${extra ? ' — ' + extra : ''}`); failed++; }
}

async function hit(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function run() {
  console.log(`\n🔍 Task 9.2 — Super Admin Plan Management Smoke Tests`);
  console.log(`   Target: ${BASE_URL}\n`);

  // ── GET trial entitlements ───────────────────────────────────
  console.log('📋 GET /api/admin/plans/entitlements?plan=trial');
  {
    const { status, data } = await hit('GET', '/api/admin/plans/entitlements?plan=trial');
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Max Guests is 50', data?.entitlements?.maxGuests === 50);
    ok('Digital Invitations disabled', data?.entitlements?.digitalInvitations === false);
  }

  // ── GET premium entitlements ─────────────────────────────────
  console.log('\n📋 GET /api/admin/plans/entitlements?plan=premium');
  {
    const { status, data } = await hit('GET', '/api/admin/plans/entitlements?plan=premium');
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Max Guests is 1000 (unlimited)', data?.entitlements?.maxGuests === 1000);
    ok('Digital Invitations enabled', data?.entitlements?.digitalInvitations === true);
    ok('Custom Domain enabled', data?.entitlements?.customDomain === true);
  }

  // ── PATCH couple plan state and support notes ────────────────
  console.log('\n✏️  PATCH /api/admin/couples/c1 — update billing state and notes');
  {
    const { status, data } = await hit('PATCH', '/api/admin/couples/c1', {
      plan: 'premium',
      billingState: 'active',
      adminNotes: 'Upgraded to premium manually after wire transfer.',
    });
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Billing state updated', data?.updated?.billingState === 'active');
    ok('Admin notes saved', data?.updated?.adminNotes?.includes('wire transfer'));
    ok('Plan updated to premium', data?.updated?.plan === 'premium');
  }

  // ── Results ─────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log(`  🎉 All plan management smoke tests passed!\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
