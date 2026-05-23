#!/usr/bin/env node
// scripts/test_task83_vendor_profile_listings.js
// Smoke tests for Task 8.3 — Vendor Profile & Service Listing Management
// Usage: BASE_URL=http://localhost:3001 node scripts/test_task83_vendor_profile_listings.js

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const VENDOR_ID = 'vnd_seed_001';

let passed = 0;
let failed = 0;
let createdListingId = null;

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
  console.log(`\n🔍 Task 8.3 — Vendor Profile & Service Listings Smoke Tests`);
  console.log(`   Target: ${BASE_URL}  |  Vendor: ${VENDOR_ID}\n`);

  // ── Vendor Portal Page ──────────────────────────────────────
  console.log('📄 Vendor Portal Page');
  {
    const res = await fetch(`${BASE_URL}/vendor`);
    ok('GET /vendor returns 200', res.status === 200, `got ${res.status}`);
  }

  // ── GET /api/vendors/:id ────────────────────────────────────
  console.log('\n📋 GET /api/vendors/:id — vendor profile');
  {
    const { status, data } = await hit('GET', `/api/vendors/${VENDOR_ID}`);
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Has vendor object', !!data?.vendor);
    ok('Has businessName', !!data?.vendor?.businessName);
    ok('Has category', !!data?.vendor?.category);
    ok('Has basePrice', typeof data?.vendor?.basePrice === 'number');
    ok('Has onboarding progress', !!data?.onboarding);
    ok('Has onboarding steps', Array.isArray(data?.onboarding?.steps));
    ok('Has onboarding pct', typeof data?.onboarding?.pct === 'number');
    ok('No passwordHash in response', !data?.vendor?.passwordHash);
  }

  // ── PUT /api/vendors/:id — update profile ───────────────────
  console.log('\n✏️  PUT /api/vendors/:id — update profile fields');
  {
    const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}`, {
      businessName: 'Lumina Studios Pro',
      description: 'Updated: Premium wedding photography and cinematic videography with an award-winning team.',
      location: 'Colombo 07, Sri Lanka',
      serviceArea: 'Island-wide including Maldives',
      basePrice: 180000,
      currency: 'LKR',
      seoTitle: 'Lumina Studios Pro | Wedding Photography Colombo',
      seoDescription: 'Award-winning wedding photography and videography in Colombo, Sri Lanka.',
      seoKeywords: 'wedding photography colombo, sri lanka photographer',
      aboutMarkdown: '## Our Story\n\nWe capture love stories.',
      faqMarkdown: '## FAQ\n\n**How early should we book?**\n6 months in advance.',
    });
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Updated businessName', data?.vendor?.businessName === 'Lumina Studios Pro', data?.vendor?.businessName);
    ok('Updated location', data?.vendor?.location === 'Colombo 07, Sri Lanka');
    ok('Updated basePrice', data?.vendor?.basePrice === 180000, `${data?.vendor?.basePrice}`);
    ok('Returns updated onboarding', !!data?.onboarding);
    ok('No passwordHash in update response', !data?.vendor?.passwordHash);
  }

  // ── PUT — empty businessName ────────────────────────────────
  console.log('\n🚫 PUT — empty businessName rejected');
  {
    const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}`, { businessName: '' });
    ok('Empty businessName returns 400', status === 400, `got ${status}`);
    ok('Error message present', !!data?.error);
  }

  // ── PUT — short description ─────────────────────────────────
  console.log('\n🚫 PUT — short description rejected');
  {
    const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}`, { description: 'Too short.' });
    ok('Short description returns 400', status === 400, `got ${status}`);
  }

  // ── PUT — negative price ────────────────────────────────────
  console.log('\n🚫 PUT — negative price rejected');
  {
    const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}`, { basePrice: -1000 });
    ok('Negative price returns 400', status === 400, `got ${status}`);
  }

  // ── PUT — too many portfolio images ─────────────────────────
  console.log('\n🚫 PUT — too many portfolio images rejected');
  {
    const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}`, {
      portfolioImages: Array(11).fill('data:image/jpeg;base64,/9j/4AAQ'),
    });
    ok('Too many portfolioImages returns 400', status === 400, `got ${status}`);
  }

  // ── PATCH partial update ────────────────────────────────────
  console.log('\n✏️  PATCH /api/vendors/:id — partial update (website only)');
  {
    const { status, data } = await hit('PATCH', `/api/vendors/${VENDOR_ID}`, {
      website: 'https://luminapro.lk',
    });
    ok('Partial PATCH returns 200', status === 200, `got ${status}`);
  }

  // ── GET /api/vendors/:id/listings ──────────────────────────
  console.log('\n📋 GET /api/vendors/:id/listings — list all listings');
  {
    const { status, data } = await hit('GET', `/api/vendors/${VENDOR_ID}/listings`);
    ok('Returns 200', status === 200, `got ${status}`);
    ok('Has listings array', Array.isArray(data?.listings));
    ok('Has total count', typeof data?.total === 'number');
    ok('Total >= 3 (seeded listings)', data?.total >= 3, `got ${data?.total}`);
    const seeded = data?.listings?.find((l) => l.id === 'lst_seed_001');
    ok('Seed listing visible', !!seeded, 'lst_seed_001 not found');
    ok('Listing has title', !!seeded?.title);
    ok('Listing has price', typeof seeded?.price === 'number');
    ok('Listing has pricingType', !!seeded?.pricingType);
    ok('Listing has active flag', typeof seeded?.active === 'boolean');
    ok('Listing has tags array', Array.isArray(seeded?.tags));
    ok('Listing has seoTitle', typeof seeded?.seoTitle === 'string');
    ok('Listing has contentMarkdown', typeof seeded?.contentMarkdown === 'string');
  }

  // ── POST /api/vendors/:id/listings — create listing ────────
  console.log('\n✅ POST — create new listing');
  {
    const { status, data } = await hit('POST', `/api/vendors/${VENDOR_ID}/listings`, {
      title: 'Engagement Party Photography',
      category: 'Photography',
      subcategory: 'Engagement Shoots',
      description: 'Beautiful coverage of your engagement party from start to finish.',
      price: 45000,
      currency: 'LKR',
      pricingType: 'fixed',
      tags: ['engagement', 'party', 'photography'],
      seoTitle: 'Engagement Party Photography Sri Lanka',
      seoDescription: 'Professional engagement party photography in Sri Lanka.',
      contentMarkdown: '## Coverage\n\n- 4 hours\n- 150+ edited photos\n- Online gallery',
      active: true,
    });
    ok('Create returns 201', status === 201, `got ${status}`);
    ok('Response has id', !!data?.listing?.id, JSON.stringify(data));
    ok('Response has title', data?.listing?.title === 'Engagement Party Photography');
    ok('Response has price', data?.listing?.price === 45000);
    ok('Response has tags', Array.isArray(data?.listing?.tags) && data.listing.tags.includes('engagement'));
    ok('Response has seoTitle', !!data?.listing?.seoTitle);
    ok('Response has contentMarkdown', !!data?.listing?.contentMarkdown);
    ok('Response has active:true', data?.listing?.active === true);
    if (data?.listing?.id) createdListingId = data.listing.id;
  }

  // ── POST — missing title ────────────────────────────────────
  console.log('\n🚫 POST — missing title rejected');
  {
    const { status, data } = await hit('POST', `/api/vendors/${VENDOR_ID}/listings`, {
      title: '', category: 'Photography', price: 10000,
    });
    ok('Missing title returns 400', status === 400, `got ${status}`);
    ok('Error mentions title', data?.error?.toLowerCase().includes('title'), data?.error);
  }

  // ── POST — missing category ─────────────────────────────────
  console.log('\n🚫 POST — missing category rejected');
  {
    const { status, data } = await hit('POST', `/api/vendors/${VENDOR_ID}/listings`, {
      title: 'Test Listing', price: 10000,
    });
    ok('Missing category returns 400', status === 400, `got ${status}`);
  }

  // ── POST — negative price ───────────────────────────────────
  console.log('\n🚫 POST — negative price rejected');
  {
    const { status, data } = await hit('POST', `/api/vendors/${VENDOR_ID}/listings`, {
      title: 'Bad Price Listing', category: 'Photography', price: -500,
    });
    ok('Negative price returns 400', status === 400, `got ${status}`);
  }

  if (createdListingId) {
    // ── GET single listing ──────────────────────────────────────
    console.log('\n🔍 GET /api/vendors/:id/listings/:lid — single listing');
    {
      const { status, data } = await hit('GET', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`);
      ok('Returns 200', status === 200, `got ${status}`);
      ok('Has listing', !!data?.listing);
      ok('Has correct id', data?.listing?.id === createdListingId);
    }

    // ── PUT — update listing ────────────────────────────────────
    console.log('\n✏️  PUT — update listing title and price');
    {
      const { status, data } = await hit('PUT', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`, {
        title: 'Engagement Party Photography (Updated)',
        price: 55000,
        seoTitle: 'Updated Engagement Photography Sri Lanka',
        contentMarkdown: '## Updated Coverage\n\n- 5 hours\n- 200+ edited photos',
      });
      ok('Update returns 200', status === 200, `got ${status}`);
      ok('Title updated', data?.listing?.title === 'Engagement Party Photography (Updated)', data?.listing?.title);
      ok('Price updated', data?.listing?.price === 55000, `${data?.listing?.price}`);
      ok('seoTitle updated', data?.listing?.seoTitle === 'Updated Engagement Photography Sri Lanka');
      ok('contentMarkdown updated', data?.listing?.contentMarkdown?.includes('200+'));
      ok('updatedAt is recent', !!data?.listing?.updatedAt);
    }

    // ── PATCH — toggle active (deactivate) ──────────────────────
    console.log('\n🔄 PATCH — deactivate listing');
    {
      const { status, data } = await hit('PATCH', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`, { active: false });
      ok('Toggle PATCH returns 200', status === 200, `got ${status}`);
      ok('Listing is now inactive', data?.listing?.active === false, `active=${data?.listing?.active}`);
    }

    // ── PATCH — toggle active (reactivate) ──────────────────────
    console.log('\n🔄 PATCH — reactivate listing');
    {
      const { status, data } = await hit('PATCH', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`, { active: true });
      ok('Reactivate PATCH returns 200', status === 200, `got ${status}`);
      ok('Listing is now active', data?.listing?.active === true, `active=${data?.listing?.active}`);
    }

    // ── GET wrong vendor ID ─────────────────────────────────────
    console.log('\n🚫 GET listing with wrong vendorId');
    {
      const { status } = await hit('GET', `/api/vendors/wrong-vendor/listings/${createdListingId}`);
      ok('Wrong vendor returns 404', status === 404, `got ${status}`);
    }

    // ── DELETE listing ──────────────────────────────────────────
    console.log('\n🗑️  DELETE created listing');
    {
      const { status, data } = await hit('DELETE', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`);
      ok('Delete returns 200', status === 200, `got ${status}`);
      ok('Response has deleted:true', data?.deleted === true);
      ok('Response has id', data?.id === createdListingId);
    }

    // ── GET deleted listing returns 404 ─────────────────────────
    console.log('\n🚫 GET deleted listing returns 404');
    {
      const { status } = await hit('GET', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`);
      ok('Deleted listing returns 404', status === 404, `got ${status}`);
    }

    // ── DELETE already deleted ──────────────────────────────────
    console.log('\n🚫 DELETE already-deleted listing returns 404');
    {
      const { status } = await hit('DELETE', `/api/vendors/${VENDOR_ID}/listings/${createdListingId}`);
      ok('Double-delete returns 404', status === 404, `got ${status}`);
    }
  }

  // ── GET vendor not found ────────────────────────────────────
  console.log('\n🚫 GET /api/vendors/:id — vendor not found');
  {
    const { status, data } = await hit('GET', '/api/vendors/nonexistent-vendor');
    ok('Returns 404', status === 404, `got ${status}`);
    ok('Error message present', !!data?.error);
  }

  // ── PUT vendor not found ────────────────────────────────────
  console.log('\n🚫 PUT /api/vendors/:id — vendor not found');
  {
    const { status } = await hit('PUT', '/api/vendors/nonexistent-vendor', { businessName: 'Test' });
    ok('Returns 404', status === 404, `got ${status}`);
  }

  // ── Results ─────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log(`  🎉 All vendor profile & listing smoke tests passed!\n`);
    process.exit(0);
  } else {
    console.error(`  ⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
