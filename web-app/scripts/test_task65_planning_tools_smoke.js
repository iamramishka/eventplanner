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

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function assertBudgetTotals(response, label) {
  const expected = {
    estimatedTotal: sum(response.items, 'estimated'),
    actualTotal: sum(response.items, 'actual'),
    reservedTotal: sum(response.items.filter(item => item.status === 'reserved'), 'actual'),
    paidTotal: sum(response.items.filter(item => item.status === 'paid'), 'actual'),
    plannedTotal: sum(response.items.filter(item => item.status === 'planned'), 'estimated'),
    remaining: sum(response.items, 'estimated') - sum(response.items, 'actual'),
  };

  for (const [key, value] of Object.entries(expected)) {
    assert(response.totals[key] === value, `${label} ${key} expected ${value}, received ${response.totals[key]}`);
  }

  for (const categoryTotal of response.categoryTotals) {
    const rows = response.items.filter(item => item.category === categoryTotal.category);
    assert(categoryTotal.estimated === sum(rows, 'estimated'), `${label} ${categoryTotal.category} estimated mismatch`);
    assert(categoryTotal.actual === sum(rows, 'actual'), `${label} ${categoryTotal.category} actual mismatch`);
    assert(categoryTotal.remaining === categoryTotal.estimated - categoryTotal.actual, `${label} ${categoryTotal.category} remaining mismatch`);
    assert(categoryTotal.itemCount === rows.length, `${label} ${categoryTotal.category} item count mismatch`);
  }
}

async function fetchBudget() {
  const res = await request('GET', `/api/weddings/${weddingId}/budget`);
  assert(res.status === 200 && Array.isArray(res.json?.items), `budget list expected 200, received ${res.status}`);
  return res.json;
}

async function verifyBudgetFlow() {
  const createdIds = [];

  try {
    let budget = await fetchBudget();
    assertBudgetTotals(budget, 'seed budget');

    let res = await request('POST', `/api/weddings/${weddingId}/budget`, {
      category: 'Entertainment',
      name: `Task 6.5 smoke music ${Date.now()}`,
      estimated: 40000,
      actual: 10000,
      status: 'reserved',
      notes: 'Task 6.5 budget smoke item',
    });
    assert(res.status === 201 && res.json?.id, `budget create expected 201, received ${res.status} ${res.text}`);
    createdIds.push(res.json.id);

    res = await request('PATCH', `/api/budget/${createdIds[0]}`, {
      estimated: 45000,
      actual: 30000,
      status: 'paid',
      notes: 'Task 6.5 budget smoke item paid',
    });
    assert(res.status === 200 && res.json?.status === 'paid', `budget update expected paid item, received ${res.status}`);
    assert(res.json.estimated === 45000 && res.json.actual === 30000, 'budget update should round-trip edited amounts');

    budget = await fetchBudget();
    assert(budget.items.some(item => item.id === createdIds[0]), 'budget list should include smoke item');
    assertBudgetTotals(budget, 'updated budget');

    const badCases = [
      ['negative budget amount', 'POST', `/api/weddings/${weddingId}/budget`, { category: 'Other', name: 'Bad amount', estimated: -1, actual: 0, status: 'planned' }, /non-negative/i],
      ['invalid budget category', 'POST', `/api/weddings/${weddingId}/budget`, { category: 'Imaginary', name: 'Bad category', estimated: 1, actual: 0, status: 'planned' }, /invalid budget category/i],
      ['invalid budget status', 'POST', `/api/weddings/${weddingId}/budget`, { category: 'Other', name: 'Bad status', estimated: 1, actual: 0, status: 'maybe' }, /invalid budget status/i],
      ['missing budget item update', 'PATCH', '/api/budget/not-a-budget-item', { name: 'Nope' }, /not found/i],
    ];

    for (const [label, method, path, body, errorPattern] of badCases) {
      res = await request(method, path, body);
      assert(res.status === 400 || res.status === 404, `${label} expected 400/404, received ${res.status}`);
      assert(res.json?.ok === false && errorPattern.test(String(res.json?.error || '')), `${label} should return safe JSON error`);
    }
  } finally {
    for (const id of createdIds) {
      await request('DELETE', `/api/budget/${id}`);
    }
  }

  const budget = await fetchBudget();
  assert(!budget.items.some(item => createdIds.includes(item.id)), 'budget cleanup should remove smoke items');
  assertBudgetTotals(budget, 'cleaned budget');
  console.log('Budget totals, category math, validation errors, delete, and cleanup passed.');
}

async function fetchChecklist() {
  const res = await request('GET', `/api/checklist?weddingId=${weddingId}`);
  assert(res.status === 200 && Array.isArray(res.json?.items), `checklist list expected 200, received ${res.status}`);
  assert(Array.isArray(res.json?.templates) && res.json.templates.length > 0, 'checklist templates should load');
  return res.json;
}

async function verifyChecklistFlow() {
  const createdIds = [];

  try {
    let checklist = await fetchChecklist();
    assert(checklist.items.length > 0, 'seed checklist should include starter items');

    let res = await request('POST', '/api/checklist', {
      weddingId,
      group: '1 week before',
      title: `Task 6.5 smoke checklist ${Date.now()}`,
      description: 'Task 6.5 checklist smoke item',
      priority: 'medium',
      dueDate: '2026-08-08',
      reminderAt: '2026-08-01T09:00',
    });
    assert(res.status === 201 && res.json?.id, `checklist create expected 201, received ${res.status} ${res.text}`);
    createdIds.push(res.json.id);

    res = await request('PATCH', `/api/checklist/${createdIds[0]}`, {
      title: 'Task 6.5 updated checklist',
      priority: 'high',
      dueDate: '2026-08-07',
    });
    assert(res.status === 200 && res.json?.title === 'Task 6.5 updated checklist', 'checklist update should persist title');
    assert(res.json.priority === 'high' && res.json.dueDate === '2026-08-07', 'checklist update should persist priority and due date');

    res = await request('PATCH', `/api/checklist/${createdIds[0]}`, { action: 'toggle', isCompleted: true });
    assert(res.status === 200 && res.json?.isCompleted === true && res.json.state === 'completed', 'checklist toggle complete should mark completed');

    res = await request('PATCH', `/api/checklist/${createdIds[0]}`, { action: 'toggle', isCompleted: false });
    assert(res.status === 200 && res.json?.isCompleted === false && res.json.state !== 'completed', 'checklist toggle incomplete should clear completed state');

    checklist = await fetchChecklist();
    assert(checklist.items.some(item => item.id === createdIds[0]), 'checklist list should include smoke item');
    const groupOrder = ['4 months before', '3 months before', '2 months before', '1 month before', '1 week before', 'Wedding Day', 'After Wedding'];
    const groupIndexes = checklist.items.map(item => groupOrder.indexOf(item.group));
    assert(groupIndexes.every((value, index, rows) => index === 0 || rows[index - 1] <= value || value === -1), 'checklist items should remain grouped in planning order');

    const badCases = [
      ['blank checklist title create', 'POST', '/api/checklist', { weddingId, title: '   ' }, /title required/i],
      ['blank checklist title update', 'PATCH', `/api/checklist/${createdIds[0]}`, { title: '   ' }, /title required/i],
      ['missing checklist update', 'PATCH', '/api/checklist/not-a-checklist-item', { title: 'Nope' }, /not found/i],
    ];

    for (const [label, method, path, body, errorPattern] of badCases) {
      res = await request(method, path, body);
      assert(res.status === 400 || res.status === 404, `${label} expected 400/404, received ${res.status}`);
      assert(res.json?.ok === false && errorPattern.test(String(res.json?.error || '')), `${label} should return safe JSON error`);
    }
  } finally {
    for (const id of createdIds) {
      await request('DELETE', `/api/checklist/${id}`);
    }
  }

  const checklist = await fetchChecklist();
  assert(!checklist.items.some(item => createdIds.includes(item.id)), 'checklist cleanup should remove smoke items');
  console.log('Checklist list, templates, create, update, toggle, sorting, validation errors, delete, and cleanup passed.');
}

async function fetchAgenda() {
  const res = await request('GET', `/api/weddings/${weddingId}/agenda`);
  assert(res.status === 200 && Array.isArray(res.json), `agenda list expected 200, received ${res.status}`);
  return res.json;
}

async function verifyAgendaFlow() {
  const createdIds = [];

  try {
    let agenda = await fetchAgenda();
    assert(agenda.length > 0, 'seed agenda should include starter events');
    assert(agenda.every((item, index, rows) => index === 0 || rows[index - 1].sortOrder <= item.sortOrder), 'seed agenda should be ordered by sortOrder');

    const first = await request('POST', `/api/weddings/${weddingId}/agenda`, {
      title: `Task 6.5 smoke photos ${Date.now()}`,
      startTime: '17:15',
      endTime: '17:45',
      timezone: 'Asia/Colombo',
      location: 'Garden steps',
      description: 'Family photo handoff',
      icon: 'Camera',
    });
    assert(first.status === 201 && first.json?.id, `first agenda create expected 201, received ${first.status} ${first.text}`);
    createdIds.push(first.json.id);

    const second = await request('POST', `/api/weddings/${weddingId}/agenda`, {
      title: `Task 6.5 smoke dinner ${Date.now()}`,
      startTime: '20:15',
      endTime: '21:00',
      timezone: 'Asia/Colombo',
      location: 'Ballroom',
      description: 'Dinner service',
      icon: 'Utensils',
    });
    assert(second.status === 201 && second.json?.id, `second agenda create expected 201, received ${second.status} ${second.text}`);
    createdIds.push(second.json.id);

    const badCases = [
      ['invalid agenda timezone', { title: 'Bad timezone', startTime: '10:00', endTime: '10:30', timezone: 'Moon/Base' }, /valid IANA timezone/i],
      ['invalid agenda time format', { title: 'Bad time', startTime: '9am', endTime: '10:30', timezone: 'Asia/Colombo' }, /HH:mm/i],
      ['agenda end before start', { title: 'Bad order', startTime: '12:30', endTime: '12:00', timezone: 'Asia/Colombo' }, /after start/i],
    ];

    for (const [label, body, errorPattern] of badCases) {
      const res = await request('POST', `/api/weddings/${weddingId}/agenda`, body);
      assert(res.status === 400, `${label} expected 400, received ${res.status}`);
      assert(res.json?.ok === false && errorPattern.test(String(res.json?.error || '')), `${label} should return safe JSON error`);
    }

    agenda = await fetchAgenda();
    const orderedIds = [
      second.json.id,
      first.json.id,
      ...agenda.map(item => item.id).filter(id => id !== second.json.id && id !== first.json.id),
    ];
    let res = await request('PATCH', `/api/weddings/${weddingId}/agenda`, { orderedIds });
    assert(res.status === 200 && Array.isArray(res.json), `agenda reorder expected 200, received ${res.status}`);
    assert(res.json[0].id === second.json.id && res.json[1].id === first.json.id, 'agenda reorder should move smoke events to the front');
    assert(res.json.every((item, index) => item.sortOrder === index), 'agenda reorder should normalize sortOrder indexes');

    res = await request('PATCH', `/api/agenda/${first.json.id}`, {
      title: 'Task 6.5 updated photo window',
      startTime: '17:20',
      endTime: '18:00',
      timezone: 'Asia/Colombo',
      location: 'Garden terrace',
      description: 'Updated portrait window',
      icon: 'Camera',
    });
    assert(res.status === 200 && res.json?.title === 'Task 6.5 updated photo window', 'agenda update should persist title');
    assert(res.json.duration === 40 && res.json.time === '17:20', 'agenda update should recalculate duration and time alias');

    res = await request('PATCH', `/api/agenda/${first.json.id}`, { endTime: '16:00' });
    assert(res.status === 400 && /after start/i.test(String(res.json?.error || '')), 'agenda invalid update should reject end before start');

    const markdown = await request('GET', `/api/weddings/${weddingId}/agenda?format=markdown`);
    assert(markdown.status === 200, `agenda markdown expected 200, received ${markdown.status}`);
    assertIncludes(markdown.text, '# Priya & Kasun Schedule', 'agenda markdown');
    assertIncludes(markdown.text, 'Date: 2026-08-15', 'agenda markdown');
    assertIncludes(markdown.text, 'Timezone: Asia/Colombo', 'agenda markdown');
    assertIncludes(markdown.text, 'Venue: Galle Face Hotel, Colombo', 'agenda markdown');
    assertIncludes(markdown.text, '| Time | Event | Location | Notes |', 'agenda markdown');
    assertIncludes(markdown.text, '| 20:15-21:00 |', 'agenda markdown reordered first smoke row');
    assertIncludes(markdown.text, '| 17:20-18:00 | Task 6.5 updated photo window | Garden terrace | Updated portrait window |', 'agenda markdown updated smoke row');
    assert(!markdown.text.includes('[object Object]'), 'agenda markdown should not contain object stringification');
    const dataRows = markdown.text.split(/\r?\n/).filter(line => line.startsWith('| ') && !line.includes('---'));
    assert(dataRows.every(line => line.split('|').slice(1, -1).every(cell => cell.trim().length > 0)), 'agenda markdown should not contain empty table cells');
  } finally {
    for (const id of createdIds) {
      await request('DELETE', `/api/agenda/${id}`);
    }
  }

  const agenda = await fetchAgenda();
  assert(!agenda.some(item => createdIds.includes(item.id)), 'agenda cleanup should remove smoke events');
  assert(agenda.every((item, index) => item.sortOrder === index), 'agenda cleanup should leave normalized ordering');
  console.log('Agenda create, validation, reorder, update, markdown print export, delete, and cleanup passed.');
}

async function run() {
  console.log('Task 6.5 planning-tool smoke suite');
  console.log(`Base URL: ${base}`);

  await verifyBudgetFlow();
  await verifyChecklistFlow();
  await verifyAgendaFlow();

  console.log('\nTask 6.5 planning-tool smoke suite passed.');
  console.log('Cleanup confirmed for smoke-created budget, checklist, and agenda data.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
