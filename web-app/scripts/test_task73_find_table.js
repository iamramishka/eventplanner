const base = process.env.BASE_URL || 'http://localhost:3000';
const weddingId = 'w_1';
const slug = 'priya-and-kasun';
const guestWithTable = { id: 'g_2', name: 'Fernando Family', phoneLast4: '0002', token: 'token_g2' };
const unassignedGuest = { id: 'g_1', name: 'Nimal Perera', phoneLast4: '0001', token: 'token_g1' };

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
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, text, json };
}

async function createTable() {
  const res = await request('POST', `/api/weddings/${weddingId}/tables`, {
    name: `Task 7.3 Table ${Date.now()}`,
    capacity: 4,
    notes: 'Near the dance floor',
  });
  assert(res.status === 200 && res.json?.data?.id, `create table failed: ${res.status} ${res.text}`);
  return res.json.data;
}

async function assignGuest(tableId, guestId) {
  const res = await request('POST', `/api/weddings/${weddingId}/tables/assign`, {
    action: 'assign',
    tableId,
    guestId,
  });
  const legacyResult = Array.isArray(res.json?.data) ? res.json.data[0] : null;
  const enhancedResult = res.json?.ok && res.json?.data?.targetTable?.id === tableId;
  assert(res.status === 200 && (legacyResult?.success || enhancedResult), `assign guest failed: ${res.status} ${res.text}`);
}

async function cleanup(tableId) {
  if (!tableId) return;
  try {
    await request('DELETE', `/api/weddings/${weddingId}/tables/${tableId}`);
  } catch {
    console.warn(`Cleanup warning: temporary table ${tableId} could not be deleted by the smoke script.`);
  }
}

function assertPrivateResult(body, tableName) {
  assert(body.ok === true, 'lookup should be ok');
  assert(body.status === 'assigned', 'lookup should report assigned table');
  assert(body.guest?.name === guestWithTable.name, 'lookup returned wrong guest name');
  assert(body.table?.name === tableName, 'lookup returned wrong table name');
  assert(!JSON.stringify(body).includes('assignedGuestIds'), 'lookup leaked assignedGuestIds');
  assert(!JSON.stringify(body).includes(unassignedGuest.name), 'lookup leaked another guest name');
}

async function run() {
  console.log('Task 7.3 Find My Table smoke suite');
  console.log(`Base URL: ${base}`);

  let tableId = '';
  try {
    const table = await createTable();
    tableId = table.id;
    await assignGuest(table.id, guestWithTable.id);
    console.log('1. Temporary table created and assigned');

    let res = await request('POST', `/api/find-table/${slug}`, { token: guestWithTable.token });
    assert(res.status === 200, `valid token lookup expected 200, received ${res.status}: ${res.text}`);
    assertPrivateResult(res.json, table.name);
    console.log('2. Valid token returns only the verified guest table');

    res = await request('POST', `/api/find-table/${slug}`, {
      name: guestWithTable.name,
      phoneLast4: guestWithTable.phoneLast4,
    });
    assert(res.status === 200, `valid details lookup expected 200, received ${res.status}: ${res.text}`);
    assertPrivateResult(res.json, table.name);
    console.log('3. Valid name and phone verification returns table');

    res = await request('POST', `/api/find-table/${slug}`, { token: 'not-a-real-token' });
    assert(res.status === 404, `invalid token expected 404, received ${res.status}`);
    assert(!res.text.includes(guestWithTable.name) && !res.text.includes(table.name), 'invalid token leaked private data');
    console.log('4. Invalid token rejected without private data');

    res = await request('POST', `/api/find-table/${slug}`, {
      name: guestWithTable.name,
      phoneLast4: '9999',
    });
    assert(res.status === 404, `wrong phone expected 404, received ${res.status}`);
    assert(!res.text.includes(guestWithTable.name) && !res.text.includes(table.name), 'wrong phone leaked private data');
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
    await cleanup(tableId);
    console.log('9. Cleaned up temporary table');
  }

  console.log('Task 7.3 Find My Table smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
