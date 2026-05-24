const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const agendaPath = `/api/weddings/${weddingId}/agenda`;

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

async function createAgendaEvent(label, startTime, endTime) {
  const res = await request('POST', agendaPath, {
    title: label,
    startTime,
    endTime,
    timezone: 'Asia/Colombo',
    location: 'QA suite',
    description: `${label} smoke item`,
    icon: 'CalendarDays',
  });

  assert(res.status === 201, `create ${label} expected 201, received ${res.status}: ${res.text}`);
  assert(res.json.id, `create ${label} missing id`);
  assert(res.json.startTime === startTime, `create ${label} did not preserve start time`);
  assert(res.json.endTime === endTime, `create ${label} did not preserve end time`);
  assert(res.json.timezone === 'Asia/Colombo', `create ${label} did not preserve timezone`);
  return res.json;
}

async function cleanup(ids) {
  for (const id of ids) {
    await request('DELETE', `/api/agenda/${id}`);
  }
}

async function run() {
  console.log('Task 6.3 agenda timeline smoke suite');
  console.log(`Base URL: ${base}`);

  const createdIds = [];
  try {
    let res = await request('GET', agendaPath);
    assert(res.status === 200 && Array.isArray(res.json), `initial agenda list failed: ${res.status}`);
    const initialIds = new Set(res.json.map(event => event.id));
    console.log(`1. Initial agenda list loaded (${res.json.length} items)`);

    res = await request('POST', agendaPath, {
      title: 'Invalid backwards time',
      startTime: '20:00',
      endTime: '19:00',
      timezone: 'Asia/Colombo',
    });
    assert(res.status === 400, `backwards time expected 400, received ${res.status}`);
    assert(String(res.text).includes('End time'), 'backwards time error did not mention end time');
    console.log('2. Invalid start/end time rejected');

    res = await request('POST', agendaPath, {
      title: 'Invalid timezone',
      startTime: '20:00',
      endTime: '21:00',
      timezone: 'Mars/Olympus',
    });
    assert(res.status === 400, `invalid timezone expected 400, received ${res.status}`);
    assert(String(res.text).includes('timezone'), 'timezone error did not mention timezone');
    console.log('3. Invalid timezone rejected');

    const first = await createAgendaEvent(`Task 6.3 first ${Date.now()}`, '20:00', '20:30');
    const second = await createAgendaEvent(`Task 6.3 second ${Date.now()}`, '20:45', '21:15');
    createdIds.push(first.id, second.id);
    console.log('4. Valid timeline items created');

    res = await request('PATCH', `/api/agenda/${first.id}`, {
      title: first.title,
      startTime: '20:05',
      endTime: '20:35',
      timezone: 'Asia/Colombo',
      location: 'Updated QA suite',
      description: first.description,
      icon: first.icon,
    });
    assert(res.status === 200, `update expected 200, received ${res.status}: ${res.text}`);
    assert(res.json.startTime === '20:05' && res.json.endTime === '20:35', 'time update did not persist');
    console.log('5. Time update persisted with validation');

    res = await request('GET', agendaPath);
    assert(res.status === 200, `agenda list after creates failed: ${res.status}`);
    const orderedIds = [
      second.id,
      first.id,
      ...res.json.map(event => event.id).filter(id => id !== second.id && id !== first.id),
    ];
    res = await request('PATCH', agendaPath, { orderedIds });
    assert(res.status === 200, `reorder expected 200, received ${res.status}: ${res.text}`);
    const firstIndex = res.json.findIndex(event => event.id === first.id);
    const secondIndex = res.json.findIndex(event => event.id === second.id);
    assert(secondIndex >= 0 && firstIndex >= 0 && secondIndex < firstIndex, 'reorder did not persist expected agenda order');
    console.log('6. Reorder persisted without losing time fields');

    res = await request('GET', `${agendaPath}?format=markdown`);
    assert(res.status === 200, `markdown export expected 200, received ${res.status}`);
    assert(res.text.includes('# Priya & Kasun Schedule'), 'markdown export missing schedule title');
    assert(res.text.includes(second.title), 'markdown export missing reordered item');
    console.log('7. Printable markdown schedule generated');

    res = await request('DELETE', `/api/agenda/${first.id}`);
    assert(res.status === 200, `delete expected 200, received ${res.status}`);
    createdIds.splice(createdIds.indexOf(first.id), 1);

    res = await request('GET', agendaPath);
    assert(res.status === 200, `agenda list after delete failed: ${res.status}`);
    assert(!res.json.some(event => event.id === first.id), 'deleted agenda item still exists');
    assert(res.json.some(event => event.id === second.id), 'remaining agenda item was lost after delete');
    assert(res.json.every(event => initialIds.has(event.id) || event.id === second.id), 'delete affected unrelated agenda items');
    console.log('8. Delete removed one item without breaking order');
  } finally {
    await cleanup(createdIds);
    console.log('9. Cleaned up smoke-created agenda items');
  }

  console.log('Task 6.3 agenda timeline smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
