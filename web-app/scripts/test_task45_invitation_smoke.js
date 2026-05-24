const fs = require('fs');

const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const validInvitationPath = '/invitation/priya-and-kasun';
const invalidInvitationPath = '/invitation/not-a-real-slug';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, body) {
  const options = {
    method,
    headers: {},
  };

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

  return {
    ok: res.ok,
    status: res.status,
    text,
    json,
  };
}

function assertIncludes(text, expected, label) {
  assert(text.includes(expected), `${label} missing expected text: ${expected}`);
}

function assertNotIncludes(text, unexpected, label) {
  assert(!text.includes(unexpected), `${label} unexpectedly included text: ${unexpected}`);
}

function assertMeta(html) {
  assert(/<title>Priya &amp; Kasun<\/title>|<title>Task 4\.5 QA Invitation<\/title>/.test(html), 'SEO title is missing expected invitation title');
  assertIncludes(html, 'name="description"', 'SEO description');
  assertIncludes(html, 'property="og:title"', 'OpenGraph title');
  assertIncludes(html, '/invitation/priya-and-kasun/opengraph-image', 'OpenGraph image');
  assertIncludes(html, 'name="twitter:card"', 'Twitter card');
  assertIncludes(html, '/invitation/priya-and-kasun/twitter-image', 'Twitter image');
  assertIncludes(html, 'application/ld+json', 'JSON-LD event');
  assertIncludes(html, '"@type":"Event"', 'JSON-LD event type');
}

function assertResponsiveMarkup(html) {
  assertIncludes(html, 'name="viewport"', 'viewport meta');
  assertIncludes(html, 'repeat(auto-fit, minmax(280px, 1fr))', 'mobile responsive invitation grid');
  assertIncludes(html, 'clamp(2.3rem, 6vw, 4.9rem)', 'responsive invitation heading');
}

function assertPreviewRouteWiring() {
  const dashboardPath = 'src/app/(admin)/couple/DashboardClient.tsx';
  const source = fs.readFileSync(dashboardPath, 'utf8');
  assertIncludes(source, 'window.open(`/invitation/${wedding?.slug}`', 'couple dashboard preview route');
  assertNotIncludes(source, 'window.open(`/${wedding?.slug}`', 'legacy preview route');
}

async function run() {
  console.log('Task 4.5 invitation smoke suite');
  console.log(`Base URL: ${base}`);

  assertPreviewRouteWiring();
  console.log('1. Preview route wiring uses /invitation/[slug]');

  let res = await request('GET', validInvitationPath);
  assert(res.status === 200, `valid invitation route expected 200, received ${res.status}`);
  assertIncludes(res.text, 'Priya &amp; Kasun', 'valid invitation route');
  assertIncludes(res.text, 'Galle Face Hotel, Colombo', 'valid invitation route');
  assertMeta(res.text);
  assertResponsiveMarkup(res.text);
  console.log('2. Valid invitation route, SEO, and responsive markup passed');

  res = await request('GET', invalidInvitationPath);
  assert([200, 404].includes(res.status), `invalid slug expected not-found response shape, received ${res.status}`);
  assertNotIncludes(res.text, 'Priya &amp; Kasun', 'invalid invitation route');
  assert(!res.text.includes('application/ld+json'), 'invalid invitation route should not emit invitation JSON-LD');
  assert(/404|not found/i.test(res.text), 'invalid invitation route should render a not-found fallback');
  console.log(`3. Invalid slug fallback passed with status ${res.status}`);

  const original = await request('GET', `/api/weddings/${weddingId}`);
  assert(original.status === 200 && original.json, `failed to load wedding ${weddingId}`);

  const originalWedding = original.json;
  const smokeIntro = `Task 4.5 editor save smoke ${Date.now()}`;
  const updatedPayload = {
    weddingTitle: 'Task 4.5 QA Invitation',
    profileImage: originalWedding.profileImage || null,
    invitationContent: {
      intro: smokeIntro,
      messageMarkdown: '### QA Smoke Message\n\nEditor save and preview content reached the public invitation.',
      detailsMarkdown: '### QA Details\n\n- **Date:** {date}\n- **Time:** {time}\n- **Venue:** {venue}',
      closingMarkdown: '### QA Closing\n\nThis section should be hidden by the smoke test.',
    },
    sections: {
      ...originalWedding.sections,
      hero: true,
      details: true,
      message: true,
      countdown: false,
      rsvp: true,
      specialMessage: false,
      venueMap: false,
    },
    story: smokeIntro,
    theme: {
      ...(originalWedding.theme || {}),
      primaryColor: '#C45A74',
      secondaryColor: '#C9A574',
      accentColor: '#8FA98F',
    },
  };

  try {
    res = await request('PATCH', `/api/weddings/${weddingId}`, updatedPayload);
    assert(res.status === 200, `editor save PATCH expected 200, received ${res.status}`);
    assert(res.json && res.json.weddingTitle === updatedPayload.weddingTitle, 'editor save did not persist wedding title');
    assert(res.json.invitationContent.intro === smokeIntro, 'editor save did not persist invitation intro');
    assert(res.json.sections.countdown === false, 'editor save did not persist section toggle');
    console.log('4. Editor save API persisted content, toggles, and theme-safe payload');

    res = await request('GET', validInvitationPath);
    assert(res.status === 200, `updated invitation route expected 200, received ${res.status}`);
    assertIncludes(res.text, 'Task 4.5 QA Invitation', 'updated invitation preview');
    assertIncludes(res.text, smokeIntro, 'updated invitation preview');
    assertIncludes(res.text, 'QA Smoke Message', 'updated invitation preview');
    assertNotIncludes(res.text, 'QA Closing', 'hidden special message section');
    assertNotIncludes(res.text, 'RSVP by', 'hidden countdown section');
    assertMeta(res.text);
    assertResponsiveMarkup(res.text);
    console.log('5. Public preview reflects saved editor changes and hidden sections');
  } finally {
    const restore = await request('PATCH', `/api/weddings/${weddingId}`, originalWedding);
    assert(restore.status === 200, `failed to restore original wedding, received ${restore.status}`);
    console.log('6. Restored original wedding record');
  }

  console.log('7. Mobile and desktop layout smoke covered by viewport meta and responsive markup checks');
  console.log('Task 4.5 invitation smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
