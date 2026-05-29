#!/usr/bin/env node
// scripts/test_task81_vendor_onboarding.js
// Smoke tests for Task 8.1 — Vendor Registration & Onboarding
// Usage: BASE_URL=http://localhost:3000 node scripts/test_task81_vendor_onboarding.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

let passed = 0;
let failed = 0;

function ok(label, cond, extra = '') {
  if (cond) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${extra ? ' — ' + extra : ''}`);
    failed++;
  }
}

async function hit(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

const VALID_PAYLOAD = {
  ownerFirstName: 'Nimal',
  ownerLastName: 'Silva',
  email: `smoke+${Date.now()}@test.lk`,
  phone: '+94771234567',
  password: 'SecurePass123',
  businessName: 'Nimal Photo Studios',
  category: 'Photography',
  subcategory: 'Wedding Photography',
  description: 'Top-rated wedding photographer with over 10 years of experience capturing love stories across Sri Lanka.',
  yearsInBusiness: 10,
  website: 'https://nimalphotos.lk',
  location: 'Colombo, Sri Lanka',
  serviceArea: 'Island-wide',
  logoBase64: '',
  portfolioImages: [],
  businessRegNumber: 'PV999888',
  taxIdNumber: '123456789V',
  businessRegDocBase64: '',
  basePrice: 80000,
  currency: 'LKR',
  pricingNotes: 'Prices start from LKR 80,000. Custom packages available.',
  packages: [
    { name: 'Essential', price: '80000', description: 'Half-day coverage' },
    { name: 'Premium', price: '150000', description: 'Full-day + edited album' },
  ],
};

async function runTests() {
  console.log(`\n🔍 Task 8.1 — Vendor Registration & Onboarding Smoke Tests`);
  console.log(`   Target: ${BASE_URL}\n`);

  // Pre-test: restore seed vendor to original state (guard against prior test pollution)
  await hit('PUT', '/api/vendors/vnd_seed_001', {
    businessName: 'Lumina Studios',
    description: 'Professional wedding photography and videography in Sri Lanka.',
    location: 'Colombo, Sri Lanka',
    basePrice: 150000,
    status: 'approved',
  }).catch(() => {});

  /* ── Vendor Register Page ── */
  console.log('📄 Vendor Registration Page');
  {
    const res = await fetch(`${BASE_URL}/vendor-register`);
    ok('GET /vendor-register returns 200', res.status === 200, `got ${res.status}`);
  }

  /* ── POST /api/vendors/register — happy path ── */
  console.log('\n✅ POST /api/vendors/register — valid submission');
  {
    const { status, data } = await hit('POST', '/api/vendors/register', VALID_PAYLOAD);
    ok('Returns 201', status === 201, `got ${status}`);
    ok('Response has id', !!data?.id, JSON.stringify(data));
    ok('Response has businessName', data?.businessName === 'Nimal Photo Studios');
    ok('Response has status: pending_review', data?.status === 'pending_review');
    ok('Response has onboardingStep: submitted', data?.onboardingStep === 'submitted');
    ok('No password in response', !data?.passwordHash && !data?.password);
    ok('No raw doc in response', !data?.businessRegDocBase64 && !data?.logoBase64);

    // Store ID for later
    if (data?.id) {
      VALID_PAYLOAD._createdId = data.id;
    }
  }

  /* ── Duplicate email ── */
  console.log('\n🚫 Duplicate email rejection');
  {
    const { status, data } = await hit('POST', '/api/vendors/register', VALID_PAYLOAD);
    ok('Duplicate email returns 409', status === 409, `got ${status}`);
    ok('Error message present', !!data?.error, data?.error);
  }

  /* ── Missing required fields ── */
  console.log('\n🚫 Missing required field validation');
  {
    const noName = { ...VALID_PAYLOAD, email: 'unique@test.lk', businessName: '' };
    const { status, data } = await hit('POST', '/api/vendors/register', noName);
    ok('Missing businessName returns 400', status === 400, `got ${status}`);
    ok('Error message references field', data?.error?.toLowerCase().includes('businessname'), data?.error);
  }

  /* ── Short description ── */
  console.log('\n🚫 Short description validation');
  {
    const short = { ...VALID_PAYLOAD, email: 'short@test.lk', description: 'Too short.' };
    const { status, data } = await hit('POST', '/api/vendors/register', short);
    ok('Short description returns 400', status === 400, `got ${status}`);
    ok('Error mentions description', data?.error?.toLowerCase().includes('description'), data?.error);
  }

  /* ── Short password ── */
  console.log('\n🚫 Short password validation');
  {
    const shortPw = { ...VALID_PAYLOAD, email: 'pwtest@test.lk', password: '123' };
    const { status, data } = await hit('POST', '/api/vendors/register', shortPw);
    ok('Short password returns 400', status === 400, `got ${status}`);
    ok('Error mentions password', data?.error?.toLowerCase().includes('password'), data?.error);
  }

  /* ── Bad email format ── */
  console.log('\n🚫 Invalid email format');
  {
    const badEmail = { ...VALID_PAYLOAD, email: 'not-an-email' };
    const { status, data } = await hit('POST', '/api/vendors/register', badEmail);
    ok('Invalid email returns 400', status === 400, `got ${status}`);
    ok('Error mentions email', data?.error?.toLowerCase().includes('email'), data?.error);
  }

  /* ── Negative price ── */
  console.log('\n🚫 Negative base price');
  {
    const negPrice = { ...VALID_PAYLOAD, email: 'negprice@test.lk', basePrice: -100 };
    const { status, data } = await hit('POST', '/api/vendors/register', negPrice);
    ok('Negative price returns 400', status === 400, `got ${status}`);
    ok('Error mentions price', data?.error?.toLowerCase().includes('price'), data?.error);
  }

  /* ── GET /api/vendors ── */
  console.log('\n📋 GET /api/vendors — public listing');
  {
    const { status, data } = await hit('GET', '/api/vendors');
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Has vendors array', Array.isArray(data?.vendors));
    ok('Has total count', typeof data?.total === 'number');
    // Seed vendor (approved) should be visible
    const seed = data?.vendors?.find((v) => v.businessName === 'Lumina Studios');
    ok('Seed vendor (approved) visible', !!seed, 'Lumina Studios not found');
    // New pending vendor should NOT be in default public listing
    const pending = data?.vendors?.find((v) => v.businessName === 'Nimal Photo Studios');
    ok('Pending vendor not in public list', !pending, 'Pending vendor incorrectly visible');
  }

  /* ── GET /api/vendors?status=pending ── */
  console.log('\n📋 GET /api/vendors?status=pending — admin view');
  {
    const { status, data } = await hit('GET', '/api/vendors?status=pending');
    ok('Returns 200', status === 200, `got ${status}`);
    const pending = data?.vendors?.find((v) => v.businessName === 'Nimal Photo Studios');
    ok('Pending vendor visible with status=pending', !!pending, 'Nimal Photo Studios not found');
  }

  /* ── GET /api/vendors?category=Photography ── */
  console.log('\n📋 GET /api/vendors?category=Photography — category filter');
  {
    const { status, data } = await hit('GET', '/api/vendors?category=Photography');
    ok('Returns 200', status === 200);
    ok('All returned vendors are photographers',
      Array.isArray(data?.vendors) && data.vendors.every((v) => v.category === 'Photography'),
      data?.vendors?.map((v) => v.category)?.join(', ')
    );
  }

  /* ── GET /api/vendors/:id (seed vendor) ── */
  console.log('\n🔍 GET /api/vendors/:id — vendor detail');
  {
    const { status, data } = await hit('GET', '/api/vendors/vnd_seed_001');
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Has vendor data', !!data?.vendor);
    ok('Has onboarding progress', Array.isArray(data?.onboarding?.steps));
    ok('Has progress pct', typeof data?.onboarding?.pct === 'number');
    ok('Seed vendor is live', data?.vendor?.onboardingStep === 'live');
  }

  /* ── GET /api/vendors/:id — not found ── */
  console.log('\n🔍 GET /api/vendors/:id — not found');
  {
    const { status, data } = await hit('GET', '/api/vendors/does-not-exist');
    ok('Not found returns 404', status === 404, `got ${status}`);
    ok('Error message present', !!data?.error);
  }

  /* ── METHOD not allowed ── */
  console.log('\n🚫 GET /api/vendors/register — method not allowed');
  {
    const { status } = await hit('GET', '/api/vendors/register');
    ok('GET on register returns 405', status === 405, `got ${status}`);
  }

  /* ── Results ── */
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log(`  🎉 All vendor onboarding smoke tests passed!\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️  ${failed} test(s) failed. Check the output above.\n`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
