const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
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
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, ok: res.ok, text, json };
}

async function createGuest(label) {
  const res = await request('POST', '/api/guests', {
    weddingId,
    name: `Task 7.2 ${label} ${Date.now()}`,
    side: 'Bride',
    whatsapp: `+9477${Math.floor(Math.random() * 9000000 + 1000000)}`,
    type: 'Individual',
    maxMembers: 1,
  });
  assert(res.status === 201 && res.json?.id, `guest create failed: ${res.status} ${res.text}`);
  return res.json;
}

async function createTable(label, capacity) {
  const res = await request('POST', `/api/weddings/${weddingId}/tables`, {
    name: `Task 7.2 ${label} ${Date.now()}`,
    capacity,
  });
  assert(res.status === 200 && res.json?.ok && res.json?.data?.id, `table create failed: ${res.status} ${res.text}`);
  return res.json.data;
}

async function assign(tableId, guestId) {
  return request('POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'assign', tableId, guestId });
}

async function unassign(guestId) {
  return request('POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'unassign', guestId });
}

async function undo(snapshot) {
  return request('POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'undo', snapshot });
}

function tableWith(tables, id) {
  const table = tables.find(item => item.id === id);
  assert(table, `table ${id} not found`);
  return table;
}

async function cleanup(tableIds, guestIds) {
  for (const tableId of tableIds) {
    await request('DELETE', `/api/weddings/${weddingId}/tables/${tableId}`);
  }
  for (const guestId of guestIds) {
    await request('DELETE', `/api/guests/${guestId}`);
  }
}

async function run() {
  console.log('Task 7.2 guest-to-table assignment smoke suite');
  console.log(`Base URL: ${base}`);

  const createdTables = [];
  const createdGuests = [];

  try {
    const guests = [];
    for (const label of ['Guest A', 'Guest B', 'Guest C', 'Guest D', 'Guest E', 'Guest F']) {
      const guest = await createGuest(label);
      guests.push(guest);
      createdGuests.push(guest.id);
    }
    const [guestA, guestB, guestC, guestD, guestE, guestF] = guests;

    const tableOne = await createTable('Table One', 2);
    const tableTwo = await createTable('Table Two', 2);
    const fullTable = await createTable('Full Table', 1);
    const bulkTable = await createTable('Bulk Table', 2);
    createdTables.push(tableOne.id, tableTwo.id, fullTable.id, bulkTable.id);
    console.log('1. Created isolated guests and tables');

    let res = await assign(tableOne.id, guestA.id);
    assert(res.status === 200 && res.json?.ok, `assign failed: ${res.status} ${res.text}`);
    let tables = res.json.data.tables;
    assert(tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'guest A should be assigned to table one');
    assert(Array.isArray(res.json.data.snapshot), 'assign should return undo snapshot');
    console.log('2. Assigned guest from unassigned state');

    let undoRes = await undo(res.json.data.snapshot);
    assert(undoRes.status === 200 && undoRes.json?.ok, `undo assign failed: ${undoRes.status} ${undoRes.text}`);
    tables = undoRes.json.data.tables;
    assert(!tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'undo should remove guest A from table one');
    console.log('3. Undo restored pre-assign state');

    res = await assign(tableOne.id, guestA.id);
    assert(res.status === 200 && res.json?.ok, 'assign before reassign should succeed');
    res = await assign(tableTwo.id, guestA.id);
    assert(res.status === 200 && res.json?.ok, `reassign failed: ${res.status} ${res.text}`);
    const reassignSnapshot = res.json.data.snapshot;
    tables = res.json.data.tables;
    assert(!tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'reassign should remove guest A from old table');
    assert(tableWith(tables, tableTwo.id).assignedGuestIds.includes(guestA.id), 'reassign should add guest A to new table');
    console.log('4. Reassigned guest without duplicate seating');

    undoRes = await undo(reassignSnapshot);
    assert(undoRes.status === 200 && undoRes.json?.ok, `undo reassign failed: ${undoRes.status} ${undoRes.text}`);
    tables = undoRes.json.data.tables;
    assert(tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'undo reassign should restore guest A to table one');
    assert(!tableWith(tables, tableTwo.id).assignedGuestIds.includes(guestA.id), 'undo reassign should remove guest A from table two');
    console.log('5. Undo restored prior table after reassign');

    res = await assign(fullTable.id, guestB.id);
    assert(res.status === 200 && res.json?.ok, 'filling full table should succeed');
    res = await assign(fullTable.id, guestC.id);
    assert(res.status === 409 && /full/i.test(res.text), `full-table conflict expected 409, received ${res.status} ${res.text}`);
    console.log('6. Full-table conflict blocked');

    res = await unassign(guestA.id);
    assert(res.status === 200 && res.json?.ok, `unassign failed: ${res.status} ${res.text}`);
    const unassignSnapshot = res.json.data.snapshot;
    tables = res.json.data.tables;
    assert(!tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'unassign should remove guest A');

    undoRes = await undo(unassignSnapshot);
    assert(undoRes.status === 200 && undoRes.json?.ok, `undo unassign failed: ${undoRes.status} ${undoRes.text}`);
    tables = undoRes.json.data.tables;
    assert(tableWith(tables, tableOne.id).assignedGuestIds.includes(guestA.id), 'undo unassign should restore guest A');
    console.log('7. Unassign and undo worked');

    res = await request('POST', `/api/weddings/${weddingId}/tables/assign`, {
      action: 'bulkAssign',
      tableId: bulkTable.id,
      guestIds: [guestD.id, guestE.id, guestF.id],
    });
    assert(res.status === 200 && res.json?.ok === false, `bulk partial conflict should return ok false: ${res.status} ${res.text}`);
    assert(res.json.data.results.filter(item => item.ok).length === 2, 'bulk should assign two guests into two seats');
    assert(res.json.data.results.filter(item => !item.ok).length === 1, 'bulk should report one capacity conflict');
    const bulkSnapshot = res.json.data.snapshot;
    tables = res.json.data.tables;
    assert(tableWith(tables, bulkTable.id).assignedGuestIds.length === 2, 'bulk table should contain two guests');
    console.log('8. Bulk assignment reported partial capacity conflict');

    undoRes = await undo(bulkSnapshot);
    assert(undoRes.status === 200 && undoRes.json?.ok, `undo bulk failed: ${undoRes.status} ${undoRes.text}`);
    tables = undoRes.json.data.tables;
    assert(tableWith(tables, bulkTable.id).assignedGuestIds.length === 0, 'undo bulk should clear bulk table');
    console.log('9. Undo restored pre-bulk seating');

    const invalidCases = [
      ['bad wedding', 'POST', '/api/weddings/not-a-wedding/tables/assign', { action: 'assign', tableId: tableOne.id, guestId: guestA.id }, 404, /wedding not found/i],
      ['bad table', 'POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'assign', tableId: 'not-a-table', guestId: guestA.id }, 404, /table not found/i],
      ['bad guest', 'POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'assign', tableId: tableOne.id, guestId: 'not-a-guest' }, 404, /guest not found/i],
      ['bad action', 'POST', `/api/weddings/${weddingId}/tables/assign`, { action: 'dance' }, 400, /invalid action/i],
    ];

    for (const [label, method, path, body, status, pattern] of invalidCases) {
      res = await request(method, path, body);
      assert(res.status === status, `${label} expected ${status}, received ${res.status}`);
      assert(pattern.test(res.text), `${label} missing expected error text: ${res.text}`);
    }
    console.log('10. Invalid assignment cases returned expected errors');

    console.log('Task 7.2 guest-to-table assignment smoke suite passed.');
  } finally {
    await cleanup(createdTables, createdGuests);
    console.log('11. Cleaned up Task 7.2 smoke fixtures');
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
