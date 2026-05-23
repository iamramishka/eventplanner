const http = require('http');
const fetch = globalThis.fetch || (async () => { throw new Error('No fetch available in this environment') })();

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
  console.log('1. List guests for w_1');
  let res = await request('GET', '/api/guests?weddingId=w_1');
  console.log('  =>', res.status, Array.isArray(res.body) ? res.body.length + ' guests' : res.body);

  console.log('2. Create a new guest');
  res = await request('POST', '/api/guests', { weddingId: 'w_1', name: 'Test Guest', side: 'Bride', whatsapp: '+123456', type: 'Individual', maxMembers: 1 });
  console.log('  =>', res.status, res.body && res.body.id ? res.body.id : res.body);
  const newId = res.body && (res.body.id || res.body);

  console.log('3. Update the guest (maxMembers=2)');
  res = await request('PATCH', '/api/guests/' + newId, { maxMembers: 2, notes: 'Updated via test' });
  console.log('  =>', res.status, res.body && res.body.maxMembers);

  console.log('4. Search filter (search=Test)');
  res = await request('GET', '/api/guests?weddingId=w_1&search=Test');
  console.log('  =>', res.status, Array.isArray(res.body) ? res.body.map(g=>g.name) : res.body);

  console.log('5. Export CSV');
  res = await fetch(base + '/api/guests/export?weddingId=w_1');
  const csv = await res.text();
  console.log('  =>', res.status, csv.split('\n').slice(0,3).join('\n'));

  console.log('6. Import CSV (2 rows)');
  const csvBody = 'weddingId,name,side,whatsapp,type,maxMembers\n' +
    'w_1,Imported Person,Guest,+100000,Individual,1\n' +
    'w_1,Imported Family,Family,+100001,Family,4\n';
  res = await fetch(base + '/api/guests/import', { method: 'POST', body: csvBody, headers: { 'Content-Type': 'text/csv' } });
  const imp = await res.json();
  console.log('  =>', res.status, imp.createdCount);

  console.log('7. Delete the created guest');
  res = await request('DELETE', '/api/guests/' + newId);
  console.log('  =>', res.status, res.body);

  console.log('\nTest complete.');
}

run().catch(e=>{console.error(e); process.exit(1)});
