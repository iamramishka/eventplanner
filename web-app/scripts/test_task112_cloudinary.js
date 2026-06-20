#!/usr/bin/env node
/**
 * Task 11.2 smoke tests — Cloudinary integration
 *
 * Tests run against a live dev server. They verify:
 *   1. Gallery upload stores a URL (Cloudinary or local disk, depending on env)
 *   2. Gallery delete removes the record
 *   3. /api/upload endpoint returns 501 when Cloudinary is not configured (default dev)
 *   4. /api/upload endpoint returns 401 without auth
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5656';
const SMOKE_KEY = process.env.SMOKE_API_KEY || 'wedplan-smoke-dev-2026';
const WEDDING_ID = 'w_1';

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function req(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-smoke-key': SMOKE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

// Tiny 1×1 red pixel PNG as base64 data URL
const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

async function run() {
  console.log(`\nTask 11.2 — Cloudinary integration smoke tests`);
  console.log(`Target: ${BASE_URL}\n`);

  // ── 1. Upload a gallery image ─────────────────────────────────
  console.log('1. Gallery upload');
  const upload = await req('POST', `/api/weddings/${WEDDING_ID}/gallery`, {
    imageBase64: TINY_PNG,
    altText: 'smoke-test',
    fileName: 'smoke-test.png',
    width: 1,
    height: 1,
  });
  assert('POST /gallery returns 201', upload.status === 201, `got ${upload.status}`);
  const imageId = upload.data?.id;
  assert('Response has id', !!imageId, JSON.stringify(upload.data));
  assert('Response has imageUrl', typeof upload.data?.imageUrl === 'string' && upload.data.imageUrl.length > 0);

  const isCloudinary = typeof upload.data?.imageUrl === 'string' && upload.data.imageUrl.startsWith('https://res.cloudinary.com');
  const isLocal = typeof upload.data?.imageUrl === 'string' && upload.data.imageUrl.startsWith('/uploads/');
  assert('imageUrl is Cloudinary URL or local path', isCloudinary || isLocal, upload.data?.imageUrl);

  if (isCloudinary) {
    assert('cloudinaryPublicId is present', !!upload.data?.cloudinaryPublicId);
    console.log('  ℹ Cloudinary is configured — images will be stored in the cloud');
  } else {
    console.log('  ℹ Cloudinary not configured — using local disk fallback');
  }

  // ── 2. List gallery images ────────────────────────────────────
  console.log('\n2. Gallery list');
  const list = await req('GET', `/api/weddings/${WEDDING_ID}/gallery`);
  assert('GET /gallery returns 200', list.status === 200, `got ${list.status}`);
  const found = Array.isArray(list.data) && list.data.some(img => img.id === imageId);
  assert('Uploaded image appears in list', found);

  // ── 3. Delete gallery image ───────────────────────────────────
  console.log('\n3. Gallery delete');
  if (imageId) {
    const del = await req('DELETE', `/api/gallery/${imageId}`);
    assert('DELETE /gallery/:id returns 200', del.status === 200, `got ${del.status}`);
    assert('Response ok:true', del.data?.ok === true);

    // Confirm removed from list
    const listAfter = await req('GET', `/api/weddings/${WEDDING_ID}/gallery`);
    const stillPresent = Array.isArray(listAfter.data) && listAfter.data.some(img => img.id === imageId);
    assert('Image no longer in list after delete', !stillPresent);
  } else {
    console.log('  ⚠ Skipping delete — no image id from upload');
    failed++;
  }

  // ── 4. /api/upload requires auth ─────────────────────────────
  console.log('\n4. /api/upload auth guard');
  const noAuth = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: TINY_PNG }),
  });
  assert('/api/upload without auth returns 401', noAuth.status === 401, `got ${noAuth.status}`);

  // ── 5. /api/upload returns 501 when Cloudinary unconfigured ──
  console.log('\n5. /api/upload Cloudinary-not-configured guard');
  if (!isCloudinary) {
    const upload501 = await req('POST', '/api/upload', { imageBase64: TINY_PNG });
    assert('/api/upload returns 501 when Cloudinary unconfigured', upload501.status === 501, `got ${upload501.status}`);
  } else {
    console.log('  ⚠ Skipping 501 check — Cloudinary is configured');
    passed++; // count as pass since Cloudinary being configured is also valid
  }

  // ── Results ───────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
