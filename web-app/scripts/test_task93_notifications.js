#!/usr/bin/env node
// scripts/test_task93_notifications.js
// Smoke tests for Task 9.3 — Notifications & WhatsApp Invite Integration
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/test_task93_notifications.js

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
  console.log(`\n🔍 Task 9.3 — Notifications Smoke Tests`);
  console.log(`   Target: ${BASE_URL}\n`);

  console.log('📋 GET /api/admin/notifications/test');
  const { status, data } = await hit('GET', '/api/admin/notifications/test');
  
  ok('Returns 200', status === 200, `got ${status}`);
  
  // Verify Email
  ok('Email invite sent successfully', data?.emailRes?.success === true);
  ok('Email delivery attempted', data?.emailRes?.attempts >= 1);
  
  // Verify WhatsApp Opt-out
  ok('WhatsApp correctly blocked for opt-out guest', data?.waResOptOut?.success === false);
  ok('WhatsApp error message mentions opt-out', data?.waResOptOut?.error?.includes('opted out'));
  
  // Verify WhatsApp Opt-in
  ok('WhatsApp invite sent to opted-in guest', data?.waResOptIn?.success === true);
  
  // Verify Broadcast
  ok('Broadcast processed multiple guests', Array.isArray(data?.broadcastRes) && data.broadcastRes.length > 0);
  
  // Results
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log(`  🎉 All notifications smoke tests passed!\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
