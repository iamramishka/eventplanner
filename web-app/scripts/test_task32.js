const fetch = globalThis.fetch || (async () => { throw new Error('No fetch available in this environment') })();
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function request(method, path, body, isJson = true) {
  const opts = { method, headers: {} };
  if (isJson) opts.headers['Content-Type'] = 'application/json';
  if (body) opts.body = isJson ? JSON.stringify(body) : body;
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, body: json };
}

async function run() {
  console.log('1. GET RSVP summary for w_1');
  let res = await request('GET', '/api/weddings/w_1/rsvps');
  console.log('  =>', res.status, res.body && res.body.counts ? res.body.counts : res.body);

  console.log('2. Create RSVP for guest g_1');
  res = await request('POST', '/api/weddings/w_1/rsvps', { guestId: 'g_1', attending: true, memberCount: 1, mealPreference: 'Veg', liquorPreference: 'No' });
  console.log('  =>', res.status, res.body && res.body.id ? res.body.id : res.body);
  const rsvpId = res.body && (res.body.id || res.body);

  console.log('3. Verify summary updated');
  res = await request('GET', '/api/weddings/w_1/rsvps');
  console.log('  =>', res.status, res.body && res.body.counts ? res.body.counts : res.body);

  console.log('4. Update RSVP (attending=false)');
  res = await request('PATCH', '/api/rsvps/' + rsvpId, { attending: false });
  console.log('  =>', res.status, res.body && res.body.memberCount, res.body && res.body.attending);

  console.log('5. Delete RSVP');
  res = await request('DELETE', '/api/rsvps/' + rsvpId);
  console.log('  =>', res.status, res.body);

  console.log('6. Final summary check');
  res = await request('GET', '/api/weddings/w_1/rsvps');
  console.log('  =>', res.status, res.body && res.body.counts ? res.body.counts : res.body);

  console.log('\nRSVP test complete.');
}

run().catch(e=>{ console.error(e); process.exit(1); });
