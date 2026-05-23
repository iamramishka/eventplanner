const base = process.env.BASE_URL || 'http://localhost:3000';
const token = 'token_g1';
const weddingId = 'w_1';
const guestId = 'g_1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ok: res.ok, text, json };
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
  assert(res.status === 200 && Array.isArray(res.json), 'RSVP list should load');
  return res.json.filter(rsvp => rsvp.guestId === guestId);
}

async function run() {
  console.log('Task 5.1 token RSVP smoke suite');
  console.log(`Base URL: ${base}`);

  await deleteGuestRsvpIfPresent();

  let res = await request('GET', `/rsvp/${token}`);
  assert(res.status === 200, `token page expected 200, received ${res.status}`);
  assert(res.text.includes('Invitation for'), 'token page should render the RSVP form');
  assert(res.text.includes('Nimal Perera'), 'token page should include guest name');
  console.log('1. Token page renders');

  res = await request('GET', '/rsvp/not-a-real-token');
  assert(res.status === 200, `invalid token page expected safe 200 fallback, received ${res.status}`);
  assert(/not valid/i.test(res.text), 'invalid token page should show safe fallback copy');
  console.log('2. Invalid token page fallback renders');

  res = await request('GET', `/api/rsvp/${token}`);
  assert(res.status === 200 && res.json?.ok, 'token API context should load');
  assert(res.json.guest.name === 'Nimal Perera', 'token API should return the invited guest only');
  assert(!res.text.includes('Fernando Family'), 'token API should not expose unrelated guests');
  console.log('3. Token API returns sanitized context');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    mealPreference: 'veg',
    liquorPreference: 'No',
    notes: 'Task 5.1 smoke accept',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, `valid accept expected 200, received ${res.status}`);
  let rows = await getGuestRsvps();
  assert(rows.length === 1, 'valid accept should create one RSVP');
  assert(rows[0].attending === true && rows[0].memberCount === 1, 'valid accept should store attending RSVP');
  console.log('4. Valid token RSVP creates a stored response');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    mealPreference: 'non-veg',
    liquorPreference: 'Yes',
    notes: 'Task 5.1 smoke update',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, 'second valid RSVP should update');
  rows = await getGuestRsvps();
  assert(rows.length === 1, 'second valid RSVP should not duplicate');
  assert(rows[0].mealPreference === 'non-veg' && rows[0].liquorPreference === 'Yes', 'second RSVP should update preferences');
  console.log('5. Repeat token RSVP updates existing response');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 99,
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 400, 'over-capacity member count should be rejected');

  res = await request('POST', `/api/rsvp/${token}`, {
    memberCount: 1,
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 400, 'missing attendance should be rejected');

  res = await request('POST', '/api/rsvp/not-a-real-token', {
    attending: true,
    memberCount: 1,
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 404, 'invalid token API submit should be rejected');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    website: 'bot-site',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 400, 'honeypot submit should be rejected');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: true,
    memberCount: 1,
    startedAt: Date.now(),
  });
  assert(res.status === 400, 'too-fast submit should be rejected');
  console.log('6. Validation and spam safeguards reject bad submissions');

  res = await request('POST', `/api/rsvp/${token}`, {
    attending: false,
    memberCount: 0,
    notes: 'Task 5.1 smoke decline',
    startedAt: Date.now() - 2000,
  });
  assert(res.status === 200 && res.json?.ok, 'decline should save');
  rows = await getGuestRsvps();
  assert(rows.length === 1, 'decline should update existing RSVP');
  assert(rows[0].attending === false && rows[0].memberCount === 0, 'decline should store zero count');
  console.log('7. Decline stores attending=false and memberCount=0');

  await deleteGuestRsvpIfPresent();
  console.log('8. Cleaned up smoke RSVP');
  console.log('Task 5.1 token RSVP smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
