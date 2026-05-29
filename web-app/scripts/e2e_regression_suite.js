#!/usr/bin/env node
// scripts/e2e_regression_suite.js
// WedPlan — Full E2E Regression Suite (Task 9.4)
// Runs all critical journey smoke tests in dependency order.
// Usage: BASE_URL=http://localhost:3000 node scripts/e2e_regression_suite.js

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SCRIPTS_DIR = __dirname;

// ── Test plan — in sprint/dependency order ──────────────────────────────
const TEST_PLAN = [
  // Sprint 2-3: Core auth, couples, guests
  { script: 'test_task22.js',                  label: 'Sprint 2 — Super Admin couple management' },
  { script: 'test_task31.js',                  label: 'Sprint 3 — Guest CRUD & capacity' },
  { script: 'test_task32.js',                  label: 'Sprint 3 — RSVP status tracking' },
  { script: 'test_task33.js',                  label: 'Sprint 3 — Trial expiry & cleanup' },
  { script: 'test_task34.js',                  label: 'Sprint 3 — Data integrity QA' },

  // Sprint 4-5: Invitation, gallery, RSVP flow
  { script: 'test_task41.js',                  label: 'Sprint 4 — Public invitation route' },
  { script: 'test_task45_invitation_smoke.js',  label: 'Sprint 4 — Invitation smoke' },
  { script: 'test_task51_rsvp_token.js',        label: 'Sprint 5 — RSVP token flow' },
  { script: 'test_task52_gallery_smoke.js',     label: 'Sprint 5 — Gallery upload/reorder/delete' },
  { script: 'test_task53_public_gallery_countdown.js', label: 'Sprint 5 — Public gallery & countdown' },
  { script: 'test_task54_sprint5_qa.js',        label: 'Sprint 5 — Full sprint QA' },

  // Sprint 6: Planning tools
  { script: 'test_task61_checklist.js',         label: 'Sprint 6 — Checklist & tasks' },
  { script: 'test_task62_budget_smoke.js',      label: 'Sprint 6 — Budget planner' },
  { script: 'test_task63_agenda_timeline.js',   label: 'Sprint 6 — Agenda & timeline' },
  { script: 'test_task64_public_agenda.js',     label: 'Sprint 6 — Public agenda display' },
  { script: 'test_task65_planning_tools_smoke.js', label: 'Sprint 6 — Planning tools full QA' },

  // Sprint 7: Seating
  { script: 'test_task71_tables_smoke.js',      label: 'Sprint 7 — Table creation & capacity' },
  { script: 'test_task72_guest_table_assignments.js', label: 'Sprint 7 — Guest assignment, undo, bulk' },
  { script: 'test_task73_find_table.js',        label: 'Sprint 7 — Guest Find My Table privacy' },
  { script: 'test_task74_seating_chart_regression.js', label: 'Sprint 7 — Seating chart full regression' },

  // Sprint 8: Vendors
  { script: 'test_task81_vendor_onboarding.js', label: 'Sprint 8 — Vendor onboarding' },
  { script: 'test_task82_vendor_approval.js',   label: 'Sprint 8 — Vendor approval workflow' },
  { script: 'test_task83_vendor_profile_listings.js', label: 'Sprint 8 — Vendor profile & listings' },
  { script: 'test_task84_vendor_browse_and_shortlist.js', label: 'Sprint 8 — Vendor browse & shortlist' },
  { script: 'test_task85_sprint8_qa.js',        label: 'Sprint 8 — Full vendor lifecycle QA' },

  // Sprint 9: Billing & notifications
  { script: 'test_task91_billing_smoke.js',     label: 'Sprint 9 — Stripe billing smoke' },
  { script: 'test_task92_plans.js',             label: 'Sprint 9 — Plan entitlements & admin' },
  { script: 'test_task93_notifications.js',     label: 'Sprint 9 — Email & WhatsApp notifications' },

  // Sprint 10: Public site
  { script: 'test_task106_sprint10_qa.js',      label: 'Sprint 10 — Public site static QA' },
];

// ── Runner ──────────────────────────────────────────────────────────────
const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║       WedPlan — Full E2E Regression Suite (Task 9.4)    ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log(`\n  Target: ${BASE_URL}`);
console.log(`  Tests:  ${TEST_PLAN.length} suites\n`);
console.log('─'.repeat(62));

const startTime = Date.now();

for (const { script, label } of TEST_PLAN) {
  const scriptPath = path.join(SCRIPTS_DIR, script);

  if (!fs.existsSync(scriptPath)) {
    console.log(`⏭  SKIP  ${label}`);
    console.log(`         (${script} not found)\n`);
    results.push({ label, script, status: 'skip' });
    skipped++;
    continue;
  }

  process.stdout.write(`▶  RUN   ${label}\n`);
  const t0 = Date.now();
  try {
    execSync(`node "${scriptPath}"`, {
      env: { ...process.env, BASE_URL },
      stdio: 'pipe',
      timeout: 60000,
    });
    const ms = Date.now() - t0;
    console.log(`   ✅ PASS (${ms}ms)\n`);
    results.push({ label, script, status: 'pass', ms });
    passed++;
  } catch (err) {
    const ms = Date.now() - t0;
    const output = (err.stdout || '').toString().trim();
    const errOut = (err.stderr || '').toString().trim();
    const detail = output || errOut || String(err.message || err);
    const lastLines = detail.split('\n').slice(-4).join('\n');
    console.log(`   ❌ FAIL (${ms}ms)`);
    console.log(`         ${lastLines.replace(/\n/g, '\n         ')}\n`);
    results.push({ label, script, status: 'fail', ms, detail: lastLines });
    failed++;
  }
}

const totalMs = Date.now() - startTime;

// ── Summary ─────────────────────────────────────────────────────────────
console.log('═'.repeat(62));
console.log('\n📊 RESULTS\n');
console.log(`  ✅ Passed:  ${passed}`);
if (skipped > 0) console.log(`  ⏭  Skipped: ${skipped}`);
if (failed > 0)  console.log(`  ❌ Failed:  ${failed}`);
console.log(`\n  Total time: ${(totalMs / 1000).toFixed(1)}s`);

if (failed > 0) {
  console.log('\n❌ FAILED SUITES:\n');
  results.filter(r => r.status === 'fail').forEach(r => {
    console.log(`  • ${r.label}`);
    console.log(`    ${(r.detail || '').split('\n')[0] || ''}`);
  });
  console.log('\n💥 Regression suite FAILED — do not release.\n');
  process.exit(1);
} else {
  console.log('\n🎉 All suites passed — release gate GREEN.\n');
  process.exit(0);
}
