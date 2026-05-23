const { spawnSync } = require('child_process');

const base = process.env.BASE_URL || 'http://localhost:3000';
const weddingId = 'w_1';
const token = 'token_g1';
const guestId = 'g_1';
// 2026-08-15 16:00 Asia/Colombo is 2026-08-15T10:30:00.000Z.
const expectedSeededCountdownTargetMs = 1786789800000;
const testPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARLJgwiBqAAA2xQIFZC8qGQAAAABJRU5ErkJggg==';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runSmokeScript(label, scriptPath) {
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    env: { ...process.env, BASE_URL: base },
    stdio: 'inherit',
  });

  assert(result.status === 0, `${label} failed with exit code ${result.status}`);
}

async function request(method, path, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(base + path, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  return { status: res.status, ok: res.ok, text, json };
}

function assertIncludes(text, expected, label) {
  assert(text.includes(expected), `${label} missing expected text: ${expected}`);
}

function readDataAttr(html, name) {
  const match = html.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : '';
}

async function deleteGuestRsvpIfPresent() {
  const res = await request('GET', `/api/rsvps?weddingId=${weddingId}`);
  const existing = Array.isArray(res.json) ? res.json.find(rsvp => rsvp.guestId === guestId) : null;
  if (existing?.id) {
    await request('DELETE', `/api/rsvps/${existing.id}`);
  }
}

async function getGuestRsvps() {
  const res = await request('GET', `/api/rsvps?weddingId=${weddingId}`);
  assert(res.status === 200 && Array.isArray(res.json), `RSVP list should load: ${res.status}`);
  return res.json.filter(rsvp => rsvp.guestId === guestId);
}

async function cleanupGallery(ids) {
  for (const id of ids) {
    await request('DELETE', `/api/gallery/${id}`);
  }
}

async function uploadGallery(label) {
  const res = await request('POST', `/api/weddings/${weddingId}/gallery`, {
    imageBase64: testPngDataUrl,
    altText: `${label} alt text`,
    fileName: `${label}.png`,
    width: 2,
    height: 2,
  });

  assert(res.status === 201 && res.json?.id, `gallery upload failed: ${res.status} ${res.text}`);
  assert(res.json.imageUrl.startsWith('/uploads/gallery/'), 'gallery upload should return an upload URL');
  assert(res.json.mimeType === 'image/png', 'gallery upload should persist MIME type');
  assert(res.json.sizeBytes > 0, 'gallery upload should persist file size');
  assert(res.json.width === 2 && res.json.height === 2, 'gallery upload should persist dimensions');
  return res.json;
}

async function verifyRsvpFlow() {
  await deleteGuestRsvpIfPresent();

  let res = await request('GET', `/rsvp/${token}`);
  assert(res.status === 200, `RSVP token page expected 200, received ${res.status}`);
  assertIncludes(res.text, 'Invitation for', 'RSVP token page');
  assertIncludes(res.text, 'Nimal Perera', 'RSVP token page guest');

  res = await request('GET', '/rsvp/not-a-real-token');
  assert(res.status === 200, `invalid token page expected safe 200 fallback, received ${res.status}`);
  assert(/not valid/i.test(res.text), 'invalid token page should show safe fallback copy');

  res = await request('GET', `/api/rsvp/${token}`);
  assert(res.status === 200 && res.json?.ok, `RSVP context expected 200, received ${res.status}`);
  assert(res.json.guest.name === 'Nimal Perera', 'RSVP context should be token-scoped');
  assert(!res.text.includes('Fernando Family'), 'RSVP context should not expose unrelated guests');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    mealPreference: 'veg',
    liquorPreference: 'No',
    notes: 'Task 5.4 QA accept',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, `valid RSVP expected 200, received ${res.status}`);
  let rows = await getGuestRsvps();
  assert(rows.length === 1 && rows[0].attending === true && rows[0].memberCount === 1, 'valid RSVP should be stored once');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    mealPreference: 'non-veg',
    liquorPreference: 'Yes',
    notes: 'Task 5.4 QA update',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, 'repeat RSVP should update');
  rows = await getGuestRsvps();
  assert(rows.length === 1, 'repeat RSVP should not duplicate');
  assert(rows[0].mealPreference === 'non-veg' && rows[0].liquorPreference === 'Yes', 'repeat RSVP should update preferences');

  const badCases = [
    ['over-capacity RSVP', `/api/rsvp/${token}`, { attending: true, memberCount: 99, startedAt: Date.now() - 2000 }, 400, /guest count/i],
    ['missing attendance RSVP', `/api/rsvp/${token}`, { memberCount: 1, startedAt: Date.now() - 2000 }, 400, /choose whether/i],
    ['invalid token RSVP', '/api/rsvp/not-a-real-token', { attending: true, memberCount: 1, startedAt: Date.now() - 2000 }, 404, /invalid invitation token/i],
    ['honeypot RSVP', `/api/rsvp/${token}`, { attending: true, memberCount: 1, website: 'bot-site', startedAt: Date.now() - 2000 }, 400, /spam/i],
    ['too-fast RSVP', `/api/rsvp/${token}`, { attending: true, memberCount: 1, startedAt: Date.now() }, 400, /take a moment/i],
  ];

  for (const [label, path, body, status, errorPattern] of badCases) {
    res = await request('POST', path, body);
    assert(res.status === status, `${label} expected ${status}, received ${res.status}`);
    assert(res.json?.ok === false && errorPattern.test(String(res.json?.error || '')), `${label} should return safe JSON error`);
  }

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: false,
    memberCount: 0,
    notes: 'Task 5.4 QA decline',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, 'decline RSVP should save');
  rows = await getGuestRsvps();
  assert(rows.length === 1 && rows[0].attending === false && rows[0].memberCount === 0, 'decline RSVP should store zero count');

  await deleteGuestRsvpIfPresent();
  rows = await getGuestRsvps();
  assert(rows.length === 0, 'Task 5.4 RSVP cleanup should remove smoke response');
  console.log('RSVP token access, submissions, validation errors, decline, and cleanup passed.');
}

async function verifyGalleryFlow() {
  const createdIds = [];

  try {
    let res = await request('GET', `/api/weddings/${weddingId}/gallery`);
    assert(res.status === 200 && Array.isArray(res.json), `gallery list expected 200 array, received ${res.status}`);
    const initialIds = new Set(res.json.map(image => image.id));

    const first = await uploadGallery(`task54-first-${Date.now()}`);
    createdIds.push(first.id);

    res = await request('PATCH', `/api/gallery/${first.id}`, { altText: 'Updated Task 5.4 alt text' });
    assert(res.status === 200 && res.json?.altText === 'Updated Task 5.4 alt text', 'gallery alt text update should persist');

    const second = await uploadGallery(`task54-second-${Date.now()}`);
    createdIds.push(second.id);

    res = await request('GET', `/api/weddings/${weddingId}/gallery`);
    assert(res.status === 200 && Array.isArray(res.json), 'gallery list after uploads should load');
    assert(res.json.filter(image => createdIds.includes(image.id)).length === 2, 'gallery list should include both uploaded images');

    const orderedIds = [
      second.id,
      first.id,
      ...res.json.map(image => image.id).filter(id => id !== second.id && id !== first.id),
    ];
    res = await request('PATCH', `/api/weddings/${weddingId}/gallery`, { orderedIds });
    assert(res.status === 200 && Array.isArray(res.json), `gallery reorder expected 200 array, received ${res.status}`);
    assert(res.json.findIndex(image => image.id === second.id) < res.json.findIndex(image => image.id === first.id), 'gallery reorder should persist');

    const galleryBadCases = [
      ['missing wedding gallery list', 'GET', '/api/weddings/not-a-wedding/gallery', undefined, 404, /wedding not found/i],
      ['invalid gallery upload body', 'POST', `/api/weddings/${weddingId}/gallery`, { imageBase64: 'not-an-image' }, 400, /imageBase64/i],
      ['missing orderedIds reorder', 'PATCH', `/api/weddings/${weddingId}/gallery`, {}, 400, /orderedIds/i],
      ['missing gallery image update', 'PATCH', '/api/gallery/not-an-image', { altText: 'Nope' }, 404, /not found/i],
      ['missing gallery image delete', 'DELETE', '/api/gallery/not-an-image', undefined, 404, /not found/i],
    ];

    for (const [label, method, path, body, status, errorPattern] of galleryBadCases) {
      res = await request(method, path, body);
      assert(res.status === status, `${label} expected ${status}, received ${res.status}`);
      assert(res.json?.ok === false && errorPattern.test(String(res.json?.error || '')), `${label} should return safe JSON error`);
    }

    res = await request('DELETE', `/api/gallery/${first.id}`);
    assert(res.status === 200 && res.json?.ok, `gallery delete expected 200, received ${res.status}`);
    createdIds.splice(createdIds.indexOf(first.id), 1);

    res = await request('GET', `/api/weddings/${weddingId}/gallery`);
    assert(!res.json.some(image => image.id === first.id), 'deleted gallery image should be absent');
    assert(res.json.some(image => image.id === second.id), 'remaining gallery image should stay present');
    assert(res.json.every(image => initialIds.has(image.id) || image.id === second.id), 'gallery delete should not affect unrelated images');
  } finally {
    await cleanupGallery(createdIds);
  }

  const res = await request('GET', `/api/weddings/${weddingId}/gallery`);
  assert(res.status === 200 && Array.isArray(res.json), 'gallery cleanup verification should load');
  assert(!res.json.some(image => createdIds.includes(image.id)), 'Task 5.4 gallery cleanup should remove smoke images');
  console.log('Gallery list, upload metadata, alt text, reorder, delete, error responses, and cleanup passed.');
}

async function verifySeededCountdown() {
  const res = await request('GET', '/invitation/priya-and-kasun');
  assert(res.status === 200, `seeded public invitation expected 200, received ${res.status}`);
  assertIncludes(res.text, 'data-testid="public-countdown"', 'seeded public countdown');
  assertIncludes(res.text, 'data-event-timezone="Asia/Colombo"', 'seeded countdown timezone');

  const targetMs = Number(readDataAttr(res.text, 'data-target-ms'));
  assert(targetMs === expectedSeededCountdownTargetMs, `seeded countdown target expected ${expectedSeededCountdownTargetMs}, received ${targetMs}`);
  console.log('Seeded public invitation countdown visibility and event target passed.');
}

async function run() {
  console.log('Task 5.4 Sprint 5 QA regression suite');
  console.log(`Base URL: ${base}`);

  runSmokeScript('1. Existing RSVP token smoke coverage', 'scripts/test_task51_rsvp_token.js');
  runSmokeScript('2. Existing gallery smoke coverage', 'scripts/test_task52_gallery_smoke.js');
  runSmokeScript('3. Existing public gallery/countdown smoke coverage', 'scripts/test_task53_public_gallery_countdown.js');

  console.log('\n4. Task 5.4 focused RSVP/error-state checks');
  await verifyRsvpFlow();

  console.log('\n5. Task 5.4 focused gallery/error-state checks');
  await verifyGalleryFlow();

  console.log('\n6. Task 5.4 seeded countdown checks');
  await verifySeededCountdown();

  console.log('\nTask 5.4 Sprint 5 QA regression suite passed.');
  console.log('Cleanup confirmed for smoke-created RSVP and gallery data.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
