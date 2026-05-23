const fetch = globalThis.fetch || (async () => { throw new Error('No fetch available') })();
const base = 'http://localhost:3000';

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { json = text; }
  return { status: res.status, ok: res.ok, body: json };
}

async function run() {
  console.log('1. GET dry-run summary + token');
  let res = await request('GET', '/api/admin/cleanup');
  console.log('  =>', res.status, res.body && res.body.summary ? res.body.summary : res.body);
  const token = res.body && res.body.confirmationToken;

  console.log('2. POST execute without force (should fail)');
  res = await request('POST', '/api/admin/cleanup', { action: 'execute', token, force: false });
  console.log('  =>', res.status, res.body && res.body.errors ? res.body.errors : res.body);

  console.log('3. POST execute with force (should run)');
  res = await request('POST', '/api/admin/cleanup', { action: 'execute', token, force: true });
  console.log('  =>', res.status, res.body && res.body.deleted ? res.body.deleted : res.body);

  console.log('\nCleanup test complete.');
}

run().catch(e=>{ console.error(e); process.exit(1) });
