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

async function main() {
  let res = await request('GET', `/api/checklist?weddingId=${weddingId}`);
  assert(res.status === 200, `initial checklist expected 200, received ${res.status}`);
  assert(Array.isArray(res.json?.items), 'initial checklist should include items');
  assert(Array.isArray(res.json?.templates) && res.json.templates.length >= 3, 'starter templates should be returned');
  const initialCount = res.json.items.length;

  res = await request('POST', '/api/checklist', {
    weddingId,
    group: '1 month before',
    title: 'Task 6.1 smoke custom task',
    description: 'Created by checklist smoke test.',
    priority: 'high',
    dueDate: '2026-07-20',
    reminderAt: '2026-07-18T09:30',
  });
  assert(res.status === 201 && res.json?.id, `create task expected 201, received ${res.status} ${res.text}`);
  const created = res.json;
  assert(created.priority === 'high', 'created task should keep high priority');
  assert(created.dueDate === '2026-07-20', 'created task should keep due date');
  assert(created.reminderAt === '2026-07-18T09:30', 'created task should keep reminder');

  res = await request('PATCH', `/api/checklist/${created.id}`, {
    title: 'Task 6.1 smoke custom task edited',
    priority: 'low',
    dueDate: '2026-07-21',
    reminderAt: '2026-07-19T10:00',
  });
  assert(res.status === 200, `edit task expected 200, received ${res.status} ${res.text}`);
  assert(res.json.title === 'Task 6.1 smoke custom task edited', 'edited task title should persist');
  assert(res.json.priority === 'low', 'edited task priority should persist');
  assert(res.json.dueDate === '2026-07-21', 'edited task due date should persist');

  res = await request('PATCH', `/api/checklist/${created.id}`, {
    action: 'toggle',
    isCompleted: true,
  });
  assert(res.status === 200, `complete task expected 200, received ${res.status} ${res.text}`);
  assert(res.json.isCompleted === true && res.json.state === 'completed', 'task should be completed');

  res = await request('GET', `/api/checklist?weddingId=${weddingId}`);
  assert(res.status === 200, 'checklist reload after completion should work');
  const completed = res.json.items.filter(item => item.isCompleted).length;
  assert(completed >= 1, 'completed count should include completed task');

  res = await request('POST', '/api/checklist/templates', {
    weddingId,
    templateId: 'wedding-week',
  });
  assert(res.status === 201, `apply template expected 201, received ${res.status} ${res.text}`);
  assert(Array.isArray(res.json.created), 'template response should include created tasks array');
  assert(Array.isArray(res.json.items) && res.json.items.length >= initialCount + 1, 'template response should return checklist items');

  const firstApplyCount = res.json.items.length;
  res = await request('POST', '/api/checklist/templates', {
    weddingId,
    templateId: 'wedding-week',
  });
  assert(res.status === 201, 'reapplying template should be safe');
  assert(res.json.created.length === 0, 'reapplying same template should not duplicate tasks');
  assert(res.json.items.length === firstApplyCount, 'template reapply should keep checklist size stable');

  res = await request('DELETE', `/api/checklist/${created.id}`);
  assert(res.status === 200 && res.json?.ok, `delete task expected 200, received ${res.status} ${res.text}`);

  console.log('Task 6.1 checklist smoke test passed.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
