const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const slug = 'priya-and-kasun';

// NOTE: This test creates its own isolated fixtures.
// It does NOT rely on seed guests so it is safe to run in any order.

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
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, ok: res.ok, text, json };
}

async function createGuest(label, phoneSuffix) {
  const res = await request('POST', '/api/guests', {
    weddingId,
    name: `Task 7.3 ${label} ${Date.now()}`,
    side: 'Groom',
    whatsapp: `+9477${phoneSuffix}`,
    type: 'Individual',
    maxMembers: 1,
  });
  assert(res.status === 201 && res.json?.id, `guest create failed: ${res.status} ${res.text}`);
  return res.json;
}

async function createTable() {
  const res = await request('POST', `/api/weddings/${weddingId}/tables`, {
    name: `Task 7.3 Table ${Date.now()}`,
    capacity: 4,
  });
  assert(res.status === 200 && res.json?.data?.id, `create table failed: ${res.status} ${res.text}`);
  return res.json.data;
}

async function assignGuest(tableId, guestId) {
  const res = await request('POST', `/api/weddings/${weddingId}/tables/assign`, {
    action: 'assign', tableId, guestId,
  });
  const ok = res.json?.ok && (res.json?.data?.targetTable?.id === tableId || Array.isArray(res.json?.data));
  assert(res.status === 200 && ok, `assign guest failed: ${res.status} ${res.text}`);
}

async function deleteGuest(guestId) {
  try {
    await request('DELETE', `/api/guests/${guestId}`);
  } catch { /* best effort */ }
}

async function deleteTable(tableId) {
  try {
    await request('DELETE', `/api/weddings/${weddingId}/tables/${tableId}`);
  } catch { /* best effort */ }
}

function getPhoneLast4(whatsapp) {
  return whatsapp.slice(-4);
}

function assertPrivateResult(body, guestName, tableName) {
  assert(body.ok === true, 'lookup should be ok');
  assert(body.status === 'assigned', 'lookup should report assigned table');
  assert(body.guest?.name === guestName, `lookup returned wrong guest name: ${body.guest?.name}`);
  assert(body.table?.name === tableName, `lookup returned wrong table name: ${body.table?.name}`);
  assert(!JSON.stringify(body).includes('assignedGuestIds'), 'lookup leaked assignedGuestIds');
}

async function run() {
  console.log('Task 7.3 Find My Table smoke suite');
  console.log(`Base URL: ${base}`);

  let assignedGuest = null;
  let unassignedGuest = null;
  let tableId = '';

  try {
    // Create isolated test guests
    const phone1 = `${Math.floor(Math.random() * 9000000 + 1000000)}`;
    const phone2 = `${Math.floor(Math.random() * 9000000 + 1000000)}`;
    assignedGuest = await createGuest('Assigned', phone1);
    unassignedGuest = await createGuest('Unassigned', phone2);

    const table = await createTable();
    tableId = table.id;
    await assignGuest(table.id, assignedGuest.id);
    console.log('1. Temporary table created and assigned');

    // Use token from created guest
    const token = assignedGuest.token;
    const phoneLast4 = getPhoneLast4(assignedGuest.whatsapp);

    let res = await request('POST', `/api/find-table/${slug}`, { token });
    assert(res.status === 200, `valid token lookup expected 200, received ${res.status}: ${res.text}`);
    assertPrivateResult(res.json, assignedGuest.name, table.name);
    assert(!JSON.stringify(res.json).includes(unassignedGuest.name), 'lookup leaked another guest name');
    console.log('2. Valid token returns only the verified guest table');

    res = await request('POST', `/api/find-table/${slug}`, {
      name: assignedGuest.name,
      phoneLast4,
    });
    assert(res.status === 200, `valid details lookup expected 200, received ${res.status}: ${res.text}`);
    assertPrivateResult(res.json, assignedGuest.name, table.name);
    console.log('3. Valid name and phone verification returns table');

    res = await request('POST', `/api/find-table/${slug}`, { token: 'invalid-token-xyz' });
    assert(res.status === 404, `invalid token expected 404, received ${res.status}`);
    assert(!res.text.includes(assignedGuest.name) && !res.text.includes(table.name), 'invalid token leaked private data');
    console.log('4. Invalid token rejected without private data');

    res = await request('POST', `/api/find-table/${slug}`, {
      name: assignedGuest.name,
      phoneLast4: '9999',
    });
    assert(res.status === 404, `wrong phone expected 404, received ${res.status}`);
    assert(!res.text.includes(assignedGuest.name), 'wrong phone leaked private data');
    console.log('5. Wrong phone digits rejected generically');

    res = await request('POST', `/api/find-table/${slug}`, { token: unassignedGuest.token });
    assert(res.status === 200, `unassigned token lookup expected 200, received ${res.status}: ${res.text}`);
    assert(res.json.status === 'unassigned', 'unassigned guest should get unassigned state');
    assert(res.json.table === null, 'unassigned guest should not receive table data');
    assert(res.text.includes('not assigned yet'), 'unassigned response should include polite not-ready copy');
    console.log('6. Verified unassigned guest receives not-ready state');

    res = await request('GET', `/invitation/${slug}`);
    assert(res.status === 200, `public invitation expected 200, received ${res.status}`);
    assert(res.text.includes('Find My Table'), 'public invitation missing Find My Table CTA');
    assert(res.text.includes(`/find-table/${slug}`), 'public invitation missing table finder link');
    console.log('7. Public invitation renders Find My Table CTA');

    res = await request('GET', `/find-table/${slug}`);
    assert(res.status === 200, `find-table page expected 200, received ${res.status}`);
    assert(res.text.includes('Find My Table'), 'find-table page missing title copy');
    assert(!res.text.includes(table.name), 'find-table page leaked table before verification');
    console.log('8. Find table page loads without pre-verification table data');

  } finally {
    await deleteTable(tableId);
    if (assignedGuest?.id) await deleteGuest(assignedGuest.id);
    if (unassignedGuest?.id) await deleteGuest(unassignedGuest.id);
    console.log('9. Cleaned up temporary table');
  }

  console.log('Task 7.3 Find My Table smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
