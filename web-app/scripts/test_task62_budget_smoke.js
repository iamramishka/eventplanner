const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const budgetPath = `/api/weddings/${weddingId}/budget`;

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

async function cleanup(ids) {
  for (const id of ids) {
    await request('DELETE', `/api/budget/${id}`);
  }
}

function expectTotals(budget, expected) {
  for (const [key, value] of Object.entries(expected)) {
    assert(budget.totals[key] === value, `${key} expected ${value}, received ${budget.totals[key]}`);
  }
}

async function run() {
  console.log('Task 6.2 budget smoke suite');
  console.log(`Base URL: ${base}`);

  const createdIds = [];
  try {
    let res = await request('GET', budgetPath);
    assert(res.status === 200 && Array.isArray(res.json?.items), `initial budget load failed: ${res.status} ${res.text}`);
    assert(res.json.categories.includes('Venue') && res.json.categories.includes('Other'), 'budget categories missing expected values');
    const initialIds = new Set(res.json.items.map(item => item.id));
    const initialTotals = { ...res.json.totals };
    console.log(`1. Initial budget loaded (${res.json.items.length} items)`);

    res = await request('POST', budgetPath, {
      category: 'Photography',
      name: `Task 6.2 photography ${Date.now()}`,
      estimated: 40000,
      actual: 10000,
      status: 'reserved',
      notes: 'Smoke photography reservation',
    });
    assert(res.status === 201 && res.json?.id, `first create failed: ${res.status} ${res.text}`);
    const first = res.json;
    createdIds.push(first.id);

    res = await request('POST', budgetPath, {
      category: 'Attire',
      name: `Task 6.2 attire ${Date.now()}`,
      estimated: 15000,
      actual: 15000,
      status: 'paid',
      notes: 'Smoke attire payment',
    });
    assert(res.status === 201 && res.json?.id, `second create failed: ${res.status} ${res.text}`);
    const second = res.json;
    createdIds.push(second.id);
    console.log('2. Created two budget items in separate categories');

    res = await request('GET', budgetPath);
    assert(res.status === 200, `budget reload after create failed: ${res.status}`);
    expectTotals(res.json, {
      estimatedTotal: initialTotals.estimatedTotal + 55000,
      actualTotal: initialTotals.actualTotal + 25000,
      reservedTotal: initialTotals.reservedTotal + 10000,
      paidTotal: initialTotals.paidTotal + 15000,
      plannedTotal: initialTotals.plannedTotal,
      remaining: initialTotals.remaining + 30000,
    });

    res = await request('PATCH', `/api/budget/${first.id}`, {
      category: 'Photography',
      name: first.name,
      estimated: 45000,
      actual: 45000,
      status: 'paid',
      notes: 'Updated smoke photography payment',
    });
    assert(res.status === 200 && res.json?.actual === 45000 && res.json?.status === 'paid', `budget update failed: ${res.status} ${res.text}`);

    res = await request('GET', budgetPath);
    assert(res.status === 200, `budget reload after update failed: ${res.status}`);
    expectTotals(res.json, {
      estimatedTotal: initialTotals.estimatedTotal + 60000,
      actualTotal: initialTotals.actualTotal + 60000,
      reservedTotal: initialTotals.reservedTotal,
      paidTotal: initialTotals.paidTotal + 60000,
      plannedTotal: initialTotals.plannedTotal,
      remaining: initialTotals.remaining,
    });
    console.log('3. Amount/status changes recalculated totals exactly');

    const note = `Task 6.2 scenario note ${Date.now()}`;
    res = await request('PATCH', `/api/weddings/${weddingId}/budget/note`, { scenarioNote: note });
    assert(res.status === 200 && res.json?.scenarioNote === note, `scenario note save failed: ${res.status} ${res.text}`);
    res = await request('GET', budgetPath);
    assert(res.status === 200 && res.json?.scenarioNote === note, 'scenario note did not persist through budget API');
    console.log('4. Scenario note persisted');

    res = await request('GET', `/api/weddings/${weddingId}/budget/export`);
    assert(res.status === 200, `budget export failed: ${res.status}`);
    assert(res.text.includes('category,item name,estimated,actual,status,notes'), 'budget export missing header');
    assert(res.text.includes(first.name) && res.text.includes(second.name), 'budget export missing created line items');
    console.log('5. CSV export contains headers and created items');

    const badCases = [
      ['missing wedding', 'GET', '/api/weddings/not-a-wedding/budget', undefined, 404, /wedding not found/i],
      ['negative amount', 'POST', budgetPath, { category: 'Venue', name: 'Bad negative', estimated: -1, actual: 0, status: 'planned' }, 400, /non-negative/i],
      ['invalid category', 'POST', budgetPath, { category: 'Invalid', name: 'Bad category', estimated: 1, actual: 0, status: 'planned' }, 400, /category/i],
      ['invalid status', 'POST', budgetPath, { category: 'Venue', name: 'Bad status', estimated: 1, actual: 0, status: 'done' }, 400, /status/i],
    ];

    for (const [label, method, path, body, status, pattern] of badCases) {
      res = await request(method, path, body);
      assert(res.status === status, `${label} expected ${status}, received ${res.status}`);
      assert(pattern.test(res.text), `${label} missing expected error text: ${res.text}`);
    }
    console.log('6. Invalid budget cases returned expected errors');

    await cleanup(createdIds);
    createdIds.length = 0;
    res = await request('GET', budgetPath);
    assert(res.status === 200, `budget reload after cleanup failed: ${res.status}`);
    assert(!res.json.items.some(item => item.id === first.id || item.id === second.id), 'deleted smoke budget items still exist');
    assert(res.json.items.every(item => initialIds.has(item.id)), 'cleanup affected unrelated budget data');
    console.log('7. Deleted smoke items without affecting unrelated budget data');

    console.log('Task 6.2 budget smoke suite passed.');
  } finally {
    await cleanup(createdIds);
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
