const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const slug = 'priya-and-kasun';

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

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function formatRange(event) {
  const start = event.startTime || event.time || '';
  const end = event.endTime || '';
  if (start && end && start !== end) return `${formatTime(start)} - ${formatTime(end)}`;
  return formatTime(start);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function cleanup(createdIds) {
  for (const id of createdIds) {
    await request('DELETE', `/api/agenda/${id}`);
  }
}

async function run() {
  console.log('Task 6.4 public agenda smoke suite');
  console.log(`Base URL: ${base}`);

  const createdIds = [];
  const longTitle = `Task 6.4 public agenda long timeline title ${Date.now()} with extra copy for truncation checks`;
  const longDescription = 'This agenda note is intentionally long so the public invitation keeps the card compact while preserving the full text in the title attribute for guests who need the detail.';

  try {
    let agendaRes = await request('GET', `/api/weddings/${weddingId}/agenda`);
    assert(agendaRes.status === 200 && Array.isArray(agendaRes.json), `agenda API expected 200 array, received ${agendaRes.status}`);
    assert(agendaRes.json.length > 0, 'seeded agenda should contain items for public comparison');
    console.log('1. Loaded dashboard/API agenda source');

    const createRes = await request('POST', `/api/weddings/${weddingId}/agenda`, {
      title: longTitle,
      startTime: '21:00',
      endTime: '21:35',
      timezone: 'Asia/Colombo',
      location: 'Public Agenda QA Suite',
      description: longDescription,
      icon: 'DefinitelyUnknownIcon',
    });
    assert(createRes.status === 201 && createRes.json?.id, `temporary agenda create failed: ${createRes.status} ${createRes.text}`);
    createdIds.push(createRes.json.id);

    const emojiRes = await request('POST', `/api/weddings/${weddingId}/agenda`, {
      title: `Task 6.4 emoji icon preservation ${Date.now()}`,
      startTime: '21:40',
      endTime: '22:00',
      timezone: 'Asia/Colombo',
      location: 'Public Agenda QA Suite',
      description: 'Temporary emoji icon preservation check.',
      icon: '💍',
    });
    assert(emojiRes.status === 201 && emojiRes.json?.id, `temporary emoji agenda create failed: ${emojiRes.status} ${emojiRes.text}`);
    createdIds.push(emojiRes.json.id);
    console.log('2. Created temporary long/fallback-icon and emoji agenda items');

    agendaRes = await request('GET', `/api/weddings/${weddingId}/agenda`);
    assert(agendaRes.status === 200 && Array.isArray(agendaRes.json), `agenda API after create expected 200 array, received ${agendaRes.status}`);
    const agenda = agendaRes.json;

    const publicRes = await request('GET', `/invitation/${slug}`);
    assert(publicRes.status === 200, `public invitation expected 200, received ${publicRes.status}`);
    const html = publicRes.text;

    assertIncludes(html, 'data-testid="public-agenda"', 'public agenda section');
    assertIncludes(html, 'data-testid="public-agenda-list"', 'public agenda list');
    assert(countMatches(html, /data-testid="public-agenda-item"/g) >= agenda.length, 'public agenda should render every API item');
    assertIncludes(html, 'class="public-agenda-title clamp-one"', 'title truncation class');
    assertIncludes(html, 'class="public-agenda-desc clamp-two"', 'description truncation class');
    assertIncludes(html, 'data-icon-mode="emoji"', 'emoji icon preservation');
    assertIncludes(html, 'data-icon-key="DefinitelyUnknownIcon"', 'unknown icon key');
    assertIncludes(html, 'data-icon-mode="fallback"', 'unknown icon fallback');
    console.log('3. Public agenda structure, truncation, and icon modes rendered');

    let lastItemIndex = -1;
    for (const event of agenda) {
      const itemIndex = html.indexOf(`data-agenda-id="${event.id}"`);
      assert(itemIndex > lastItemIndex, `public agenda order mismatch around ${event.title}`);
      lastItemIndex = itemIndex;

      assertIncludes(html, formatRange(event), `public time label for ${event.title}`);
      assertIncludes(html, event.id, `public data id for ${event.title}`);
      assertIncludes(html, escapeHtml(event.title), `public title for ${event.title}`);
      if (event.location) assertIncludes(html, event.location, `public location for ${event.title}`);
      if (event.description) assertIncludes(html, escapeHtml(event.description), `public description for ${event.title}`);
    }
    console.log('4. Public agenda matches dashboard/API order, labels, and item content');

    assertIncludes(html, longTitle, 'long temporary title');
    assertIncludes(html, longDescription, 'long temporary description');
    assertIncludes(html, 'Public Agenda QA Suite', 'temporary location');
    assertIncludes(html, '35 min', 'temporary duration');
    console.log('Task 6.4 public agenda smoke suite passed.');
  } finally {
    await cleanup(createdIds);
    console.log('5. Cleaned up temporary agenda items');
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
