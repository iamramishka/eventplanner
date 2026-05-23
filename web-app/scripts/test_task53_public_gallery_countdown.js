const base = process.env.BASE_URL || 'http://localhost:3000';
const testPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARLJgwiBqAAA2xQIFZC8qGQAAAABJRU5ErkJggg==';

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

function expectedTargetMs() {
  return Date.UTC(2026, 7, 15, 10, 30, 0);
}

function readDataAttr(html, name) {
  const match = html.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : '';
}

async function cleanup(ids) {
  for (const id of ids) {
    await request('DELETE', `/api/gallery/${id}`);
  }
}

async function run() {
  console.log('Task 5.3 public gallery/countdown smoke suite');
  console.log(`Base URL: ${base}`);

  const slug = `task-53-gallery-countdown-${Date.now()}`;
  const createdGalleryIds = [];

  const weddingRes = await request('POST', '/api/couples', {
    groomName: 'Countdown',
    brideName: 'Gallery',
    weddingTitle: 'Gallery & Countdown QA',
    date: '2026-08-15',
    time: '16:00',
    timezone: 'Asia/Colombo',
    venueName: 'Task 5.3 Venue',
    venueAddress: 'Colombo',
    slug,
    sections: {
      hero: true,
      details: true,
      countdown: true,
      gallery: true,
      rsvp: false,
      venueMap: false,
      specialMessage: false,
    },
    invitationContent: {
      intro: 'Task 5.3 public invitation smoke.',
      messageMarkdown: '### Welcome\n\nGallery and countdown smoke coverage.',
      detailsMarkdown: '### Details\n\n- **Date:** {date}\n- **Time:** {time}\n- **Venue:** {venue}',
      closingMarkdown: '### Thanks\n\nHidden for this test.',
    },
  });

  assert(weddingRes.status === 201 && weddingRes.json?.id, `temporary wedding create failed: ${weddingRes.status} ${weddingRes.text}`);
  const weddingId = weddingRes.json.id;
  console.log('1. Created isolated wedding fixture');

  try {
    let res = await request('GET', `/invitation/${slug}`);
    assert(res.status === 200, `empty public invitation expected 200, received ${res.status}`);
    assertIncludes(res.text, 'data-testid="public-gallery"', 'public gallery section');
    assertIncludes(res.text, 'data-testid="public-gallery-empty"', 'empty public gallery fallback');
    assertIncludes(res.text, 'Photos coming soon', 'empty public gallery fallback copy');
    assertIncludes(res.text, 'data-testid="public-countdown"', 'public countdown');
    assertIncludes(res.text, 'data-event-timezone="Asia/Colombo"', 'countdown timezone data');
    assertIncludes(res.text, 'data-event-label=', 'countdown event label');

    const targetMs = Number(readDataAttr(res.text, 'data-target-ms'));
    assert(targetMs === expectedTargetMs(), `countdown target expected ${expectedTargetMs()}, received ${targetMs}`);
    console.log('2. Empty gallery fallback and timezone-aware countdown rendered');

    const uploadRes = await request('POST', `/api/weddings/${weddingId}/gallery`, {
      imageBase64: testPngDataUrl,
      altText: 'Task 5.3 gallery alt text',
      fileName: 'task-53-public-gallery.png',
      width: 2,
      height: 2,
    });
    assert(uploadRes.status === 201 && uploadRes.json?.id, `gallery upload failed: ${uploadRes.status} ${uploadRes.text}`);
    createdGalleryIds.push(uploadRes.json.id);
    console.log('3. Uploaded live gallery image');

    res = await request('GET', `/invitation/${slug}`);
    assert(res.status === 200, `gallery public invitation expected 200, received ${res.status}`);
    assertIncludes(res.text, 'data-testid="public-gallery-grid"', 'public gallery grid');
    assertIncludes(res.text, 'data-testid="public-gallery-item"', 'public gallery item');
    assertIncludes(res.text, 'Task 5.3 gallery alt text', 'public gallery alt text');
    assertIncludes(res.text, 'loading="lazy"', 'lazy gallery image');
    assertIncludes(res.text, 'sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"', 'responsive gallery image sizes');
    assert(!res.text.includes('data-testid="public-gallery-empty"'), 'gallery empty fallback should not render after upload');
    console.log('4. Live gallery data rendered with lazy responsive media');

    console.log('Task 5.3 public gallery/countdown smoke suite passed.');
  } finally {
    await cleanup(createdGalleryIds);
    console.log('5. Cleaned up uploaded gallery fixture images');
  }
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
