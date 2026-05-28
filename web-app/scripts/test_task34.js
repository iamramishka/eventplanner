const fetch = globalThis.fetch || (async () => { throw new Error('No fetch available in this environment') })();
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function request(method, path, body, isJson = true, isCsv = false) {
  const opts = { method, headers: {} };
  if (isJson) opts.headers['Content-Type'] = 'application/json';
  if (isCsv) opts.headers['Content-Type'] = 'text/csv';
  if (body) opts.body = isJson ? JSON.stringify(body) : body;
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, ok: res.ok, body: json, text };
}

async function run() {
  console.log('1. GET Initial RSVP Counts');
  let res = await request('GET', '/api/weddings/w_1/rsvps');
  console.log('  =>', res.status, 'attendingGuests:', res.body.counts && res.body.counts.attendingGuests);

  console.log('2. Update Guest (g_2)');
  res = await request('PATCH', '/api/guests/g_2', { name: 'Fernando Family Updated' });
  console.log('  =>', res.status, res.body && res.body.name);

  console.log('3. Create Guest (CRUD Smoke)');
  res = await request('POST', '/api/guests', { weddingId: 'w_1', name: 'Test Guest', maxMembers: 3 });
  console.log('  =>', res.status, res.body && res.body.id);

  console.log('4. Delete Guest (Cleanup Protections) - Deleting g_2');
  res = await request('DELETE', '/api/guests/g_2');
  console.log('  =>', res.status);

  console.log('5. Verify RSVP is Deleted for g_2');
  // we can check if it still exists via guests API if rsvps API is isolated
  res = await request('GET', '/api/weddings/w_1/rsvps');
  let rsvpList = res.body.rsvps || (res.body.data || []);
  const stillExists = rsvpList.find(r => r.guestId === 'g_2');
  console.log('  => RSVP for g_2 still exists?', !!stillExists);

  console.log('6. Export Guests');
  res = await request('GET', '/api/guests/export?weddingId=w_1', null, false);
  console.log('  =>', res.status, res.text.substring(0, 50).replace(/\n/g, '\\n') + '...');

  console.log('7. Import Guests Round-Trip');
  const csvData = `weddingId,name,side,whatsapp,type,maxMembers,notes\nw_1,Imported Guest,Groom,,Individual,1,`;
  res = await request('POST', '/api/guests/import', csvData, false, true);
  console.log('  =>', res.status, res.body && res.body.createdCount, 'imported');

  console.log('\nTask 3.4 Verification Complete.');
}

run().catch(e=>{ console.error(e); process.exit(1); });
