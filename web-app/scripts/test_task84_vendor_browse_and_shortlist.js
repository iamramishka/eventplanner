#!/usr/bin/env node
// scripts/test_task84_vendor_browse_and_shortlist.js
// Usage: BASE_URL=http://127.0.0.1:3000 node scripts/test_task84_vendor_browse_and_shortlist.js

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';

let passed = 0;
let failed = 0;

function ok(label, cond, extra = '') {
  if (cond) { console.log(`  ✅ ${label}`); passed++; }
  else { console.error(`  ❌ ${label}${extra ? ' — ' + extra : ''}`); failed++; }
}

async function hit(method, path) {
  const res = await fetch(`${BASE_URL}${path}`, { method });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function run() {
  console.log(`\n🔍 Task 8.4 — Vendor Browsing & Shortlist Tests`);
  console.log(`   Target: ${BASE_URL}\n`);

  console.log('📋 GET /api/vendors — List all public approved vendors');
  {
    const { status, data } = await hit('GET', `/api/vendors`);
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Has vendors array', Array.isArray(data?.vendors));
    ok('Has total count', typeof data?.total === 'number');
    
    // We expect the seed vendor 'vnd_seed_001' to be here
    const seed = data?.vendors?.find(v => v.id === 'vnd_seed_001');
    ok('Seed vendor is publicly visible', !!seed);
    if (seed) {
      ok('Public vendor object has no passwordHash', !seed.passwordHash);
      ok('Public vendor has businessName', !!seed.businessName);
      ok('Public vendor has category', !!seed.category);
    }
  }

  console.log('\n🔎 GET /api/vendors?q=lumina — Search by keyword');
  {
    const { status, data } = await hit('GET', `/api/vendors?q=lumina`);
    ok('Returns 200', status === 200);
    ok('Search matches seed vendor', data?.vendors?.some(v => v.businessName.toLowerCase().includes('lumina')));
  }

  console.log('\n🔎 GET /api/vendors?category=Photography — Filter by category');
  {
    const { status, data } = await hit('GET', `/api/vendors?category=Photography`);
    ok('Returns 200', status === 200);
    ok('Filter returns Photography vendors', data?.vendors?.every(v => v.category === 'Photography'));
  }

  console.log('\n🔎 GET /api/vendors?category=Catering — Filter by category (no results)');
  {
    const { status, data } = await hit('GET', `/api/vendors?category=XYZFakeCategory`);
    ok('Returns 200', status === 200);
    ok('Filter returns 0 vendors', data?.vendors?.length === 0);
  }

  console.log('\n📄 Vendors Browse Page Load');
  {
    const res = await fetch(`${BASE_URL}/vendors`);
    ok('GET /vendors returns 200', res.status === 200, `got ${res.status}`);
  }

  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log(`  🎉 Task 8.4 smoke tests passed!\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
