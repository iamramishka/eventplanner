// Basic smoke test for tables API
// Usage: NODE_ENV=development node web-app/scripts/test_task71_tables_smoke.js

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = process.env.WEDDING_ID || 'w_1';

async function run() {
  try {
    console.log('Creating table with capacity 2...');
    let res = await fetch(`${BASE}/api/weddings/${weddingId}/tables`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Test Table', capacity: 2 }) });
    let json = await res.json();
    if (!json.data) throw new Error('create failed: ' + JSON.stringify(json));
    const table = json.data;
    console.log('Created table', table.id);

    // fallback: assign known seeded guests g_1 g_2
    const guestIds = ['g_1','g_2','g_3'];

    console.log('Assigning guest g_1');
    res = await fetch(`${BASE}/api/weddings/${weddingId}/tables/assign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'assign', tableId: table.id, guestId: guestIds[0] }) });
    json = await res.json();
    console.log('assign1', json);

    console.log('Assigning guest g_2');
    res = await fetch(`${BASE}/api/weddings/${weddingId}/tables/assign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'assign', tableId: table.id, guestId: guestIds[1] }) });
    json = await res.json();
    console.log('assign2', json);

    console.log('Attempting to assign third guest (should fail due to capacity)');
    res = await fetch(`${BASE}/api/weddings/${weddingId}/tables/assign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'assign', tableId: table.id, guestId: guestIds[2] }) });
    json = await res.json();
    console.log('assign3', json);

    if (json?.error) {
      console.log('Capacity enforcement worked:', json.error);
      process.exit(0);
    }

    console.log('Warning: capacity enforcement did not return error as expected.');
    process.exit(1);
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exit(2);
  }
}

run();
