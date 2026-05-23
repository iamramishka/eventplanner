const base = process.env.BASE_URL || 'http://localhost:3000';
const weddingId = 'w_1';

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

async function createGuest(label, wedding = weddingId) {
  const res = await request('POST', '/api/guests', {
    weddingId: wedding,
    name: `Task 7.4 ${label} ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`,
    side: 'QA',
    whatsapp: '+94779990000',
    type: 'Individual',
    maxMembers: 1,
    notes: 'Task 7.4 regression fixture',
  });
  assert(res.status === 201 && res.json?.id && res.json?.token, `guest create failed: ${res.status} ${res.text}`);
  return res.json;
}

async function createTable(label, capacity) {
  const res = await request('POST', `/api/weddings/${weddingId}/tables`, {
    name: `Task 7.4 ${label} ${Date.now()} ${Math.random().toString(36).slice(2, 6)}`,
    capacity,
  });
  assert(res.status === 200 && res.json?.ok && res.json?.data?.id, `table create failed: ${res.status} ${res.text}`);
  return res.json.data;
}

async function getTables() {
  const res = await request('GET', `/api/weddings/${weddingId}/tables`);
  assert(res.status === 200 && res.json?.ok && Array.isArray(res.json.data), `table list failed: ${res.status} ${res.text}`);
  return res.json.data;
}

async function assign(tableId, guestId) {
  return request('POST', `/api/weddings/${weddingId}/tables/assign`, {
    action: 'assign',
    tableId,
    guestId,
  });
}

function tableById(tables, id) {
  return tables.find(table => table.id === id);
}

function assignedTo(tables, guestId) {
  return tables.filter(table => (table.assignedGuestIds || []).includes(guestId));
}

async function cleanup({ tableIds, guestIds }) {
  for (const tableId of tableIds.reverse()) {
    await request('DELETE', `/api/weddings/${weddingId}/tables/${tableId}`);
  }
  for (const guestId of guestIds.reverse()) {
    await request('DELETE', `/api/guests/${guestId}`);
  }
}

async function run() {
  console.log('Task 7.4 seating-chart regression suite');
  console.log(`Base URL: ${base}`);

  const tableIds = [];
  const guestIds = [];

  try {
    const guests = [
      await createGuest('Guest A'),
      await createGuest('Guest B'),
      await createGuest('Guest C'),
      await createGuest('Guest D'),
    ];
    guestIds.push(...guests.map(guest => guest.id));

    const otherWeddingGuest = await createGuest('Other Wedding Guest', 'w_task74_other');
    guestIds.push(otherWeddingGuest.id);
    console.log('1. Created isolated seating guests');

    const tableA = await createTable('Table A', 2);
    const tableB = await createTable('Table B', 1);
    const tableC = await createTable('Table C', 1);
    const deletedTable = await createTable('Deleted Table', 4);
    tableIds.push(tableA.id, tableB.id, tableC.id, deletedTable.id);
    console.log('2. Created isolated seating tables');

    let res = await request('DELETE', `/api/weddings/${weddingId}/tables/${deletedTable.id}`);
    assert(res.status === 200 && res.json?.ok, `delete table failed: ${res.status} ${res.text}`);
    tableIds.splice(tableIds.indexOf(deletedTable.id), 1);

    res = await request('POST', `/api/weddings/${weddingId}/tables`, { name: 'Bad Capacity', capacity: 0 });
    assert(res.status === 400 && /capacity/i.test(res.text), 'capacity lower bound should be rejected');

    res = await assign(tableA.id, guests[0].id);
    assert(res.status === 200 && res.json?.ok && res.json.data.targetTable.id === tableA.id, 'first assignment should succeed');

    res = await assign(tableA.id, guests[0].id);
    assert(res.status === 200 && res.json?.ok && res.json.data.noOp === true, 'duplicate same-table assignment should be a no-op');

    res = await assign(tableA.id, guests[1].id);
    assert(res.status === 200 && res.json?.ok, 'second assignment should fill table A');

    res = await assign(tableA.id, guests[2].id);
    assert(res.status === 409 && res.json?.code === 'TABLE_FULL', `full table assignment should return TABLE_FULL: ${res.status} ${res.text}`);

    let tables = await getTables();
    assert(tableById(tables, tableA.id).assignedGuestIds.length === 2, 'table A should stay at capacity');
    assert(assignedTo(tables, guests[2].id).length === 0, 'failed assignment should not seat guest C');

    res = await request('PUT', `/api/weddings/${weddingId}/tables/${tableA.id}`, { capacity: 1 });
    assert(res.status === 400 && /capacity/i.test(res.text), 'cannot reduce capacity below assigned count');
    console.log('3. Capacity enforcement and duplicate assignment checks passed');

    res = await assign(tableC.id, guests[0].id);
    assert(res.status === 200 && res.json?.ok && res.json.data.sourceTable.id === tableA.id && res.json.data.targetTable.id === tableC.id, 'reassignment should report source and target');

    tables = await getTables();
    assert(assignedTo(tables, guests[0].id).length === 1 && assignedTo(tables, guests[0].id)[0].id === tableC.id, 'reassigned guest should appear on exactly one table');
    assert(!(tableById(tables, tableA.id).assignedGuestIds || []).includes(guests[0].id), 'reassigned guest should leave previous table');

    res = await request('POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'unassign', guestId: guests[0].id });
    assert(res.status === 200 && res.json?.ok && res.json.data.sourceTable.id === tableC.id, 'unassign should return source table');
    tables = await getTables();
    assert(assignedTo(tables, guests[0].id).length === 0, 'unassigned guest should not appear on any table');

    res = await request('POST', `/api/weddings/${weddingId}/tables/assign`, {
      action: 'bulkAssign',
      tableId: tableB.id,
      guestIds: [guests[2].id, guests[3].id],
    });
    assert(res.status === 200 && res.json?.ok === false, 'bulk over-capacity should return partial failure');
    assert(res.json.data.results.some(item => item.ok === true), 'bulk assignment should include a success result');
    assert(res.json.data.results.some(item => item.ok === false && item.code === 'TABLE_FULL'), 'bulk assignment should include TABLE_FULL failure');

    tables = await getTables();
    assert(tableById(tables, tableB.id).assignedGuestIds.length === 1, 'bulk assignment should not overfill table B');

    res = await assign(tableB.id, otherWeddingGuest.id);
    assert(res.status === 404 && res.json?.code === 'GUEST_NOT_FOUND', 'guest from another wedding should not be assignable');
    console.log('4. Reassign, unassign, bulk conflict, and cross-wedding checks passed');

    res = await assign(tableC.id, guests[0].id);
    assert(res.status === 200 && res.json?.ok, 'guest A should be assigned for lookup privacy check');

    res = await request('GET', `/api/rsvp/${guests[0].token}/table`);
    assert(res.status === 200 && res.json?.ok, `token table lookup failed: ${res.status} ${res.text}`);
    assert(res.json.guest.name === guests[0].name, 'lookup should return token holder name');
    assert(res.json.table?.name === tableC.name, 'lookup should return token holder table');
    assert(!res.text.includes(guests[1].name), 'lookup should not leak other guest names');
    assert(!res.text.includes(tableA.name), 'lookup should not leak unrelated table names');

    res = await request('GET', '/api/rsvp/not-a-real-token/table');
    assert(res.status === 404 && res.json?.ok === false, 'invalid token lookup should return safe 404');
    console.log('5. Guest table lookup privacy checks passed');

    res = await request('GET', `/api/weddings/${weddingId}/tables/export`);
    assert(res.status === 200, `seating export failed: ${res.status} ${res.text}`);
    assert(res.text.includes('"section","table name","capacity","assigned count","guest name","guest id"'), 'export should include CSV header');
    assert(res.text.includes(tableA.name) && res.text.includes(tableB.name) && res.text.includes(tableC.name), 'export should include active temp tables');
    assert(res.text.includes(guests[0].name) && res.text.includes(guests[1].name), 'export should include assigned temp guests');
    assert(res.text.includes('"unassigned"'), 'export should include unassigned guests section');
    assert(!res.text.includes(deletedTable.name), 'export should exclude deleted table');
    console.log('6. Seating export checks passed');

    console.log('Task 7.4 seating-chart regression suite passed.');
  } finally {
    await cleanup({ tableIds, guestIds });
    console.log('7. Cleaned up temporary seating fixtures');
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
