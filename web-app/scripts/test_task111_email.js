#!/usr/bin/env node
/**
 * Task 11.1 smoke tests — Resend email integration
 */

const BASE_URL  = process.env.BASE_URL  || 'http://localhost:5656';
const SMOKE_KEY = process.env.SMOKE_API_KEY || 'wedplan-smoke-dev-2026';

let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`); failed++; }
}

async function req(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-smoke-key': SMOKE_KEY, 'content-type': 'application/json', ...opts.headers },
    ...opts,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function run() {
  console.log(`\nTask 11.1 — Email delivery smoke tests`);
  console.log(`Target: ${BASE_URL}\n`);

  // ── 1. Notifications test endpoint (uses sendEmailNotification) ───
  console.log('1. Email notification via admin test endpoint');
  const r = await req('/api/admin/notifications/test');
  assert('GET /api/admin/notifications/test returns 200', r.status === 200, `got ${r.status}`);

  const { emailRes, waResOptOut, waResOptIn, broadcastRes } = r.data;

  assert('emailRes.success is true', emailRes?.success === true, JSON.stringify(emailRes));
  assert('emailRes has messageId', typeof emailRes?.messageId === 'string', JSON.stringify(emailRes));
  assert('emailRes.channel is email', emailRes?.channel === 'email');

  // ── 2. WhatsApp opt-out still blocked ────────────────────────────
  console.log('\n2. WhatsApp opt-out guard (unchanged)');
  assert('waResOptOut.success is false', waResOptOut?.success === false);
  assert('waResOptOut error mentions opt-out', waResOptOut?.error?.includes('opted out'));

  // ── 3. WhatsApp opt-in still works ───────────────────────────────
  console.log('\n3. WhatsApp opt-in (unchanged)');
  assert('waResOptIn.success is true', waResOptIn?.success === true);

  // ── 4. Broadcast ─────────────────────────────────────────────────
  console.log('\n4. Email broadcast');
  assert('broadcastRes is an array', Array.isArray(broadcastRes));
  const broadcastSuccesses = Array.isArray(broadcastRes)
    ? broadcastRes.filter(r => r.success && r.channel === 'email').length
    : 0;
  assert('At least one broadcast email succeeded', broadcastSuccesses >= 1, `${broadcastSuccesses} email successes`);

  // ── 5. Auth guard ─────────────────────────────────────────────────
  console.log('\n5. Auth guard');
  const noAuth = await fetch(`${BASE_URL}/api/admin/notifications/test`);
  assert('Returns 401 without auth', noAuth.status === 401, `got ${noAuth.status}`);

  // ── 6. Password reset (no enumeration) ───────────────────────────
  console.log('\n6. Password reset — user enumeration guard');
  const reset = await fetch(`${BASE_URL}/api/auth/request-reset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com' }),
  });
  assert('Returns 200 for unknown email (no enumeration)', reset.status === 200, `got ${reset.status}`);
  const resetData = await reset.json().catch(() => ({}));
  assert('Returns ok:true', resetData.ok === true);

  // ── 7. Password reset missing email ──────────────────────────────
  console.log('\n7. Password reset — missing email');
  const badReset = await fetch(`${BASE_URL}/api/auth/request-reset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert('Returns 400 when email missing', badReset.status === 400, `got ${badReset.status}`);

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
