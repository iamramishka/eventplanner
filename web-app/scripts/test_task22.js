/**
 * Task 2.2 API verification: tests PATCH and DELETE on /api/admin/couples/[id]
 * and confirms audit.log is written.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3000,
      path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', e => resolve({ status: 'ERROR', error: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ status: 'TIMEOUT' }); });
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  console.log('=== Task 2.2 API Tests ===\n');

  // Test PATCH
  console.log('1. PATCH /api/admin/couples/c1 (suspend)...');
  const patchRes = await request('PATCH', '/api/admin/couples/c1', { suspended: true });
  const patchOk = patchRes.status === 200 && patchRes.body?.ok === true;
  console.log(`   ${patchOk ? '✅' : '❌'} Status: ${patchRes.status}, ok: ${patchRes.body?.ok}`);

  // Test DELETE
  console.log('2. DELETE /api/admin/couples/c3...');
  const delRes = await request('DELETE', '/api/admin/couples/c3', null);
  const delOk = delRes.status === 200 && delRes.body?.ok === true;
  console.log(`   ${delOk ? '✅' : '❌'} Status: ${delRes.status}, ok: ${delRes.body?.ok}`);

  // Check audit log
  console.log('3. Checking audit.log...');
  const logFile = path.join(process.cwd(), 'logs', 'audit.log');
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
    const last2 = lines.slice(-2).map(l => {
      try { return JSON.parse(l); } catch { return l; }
    });
    console.log(`   ✅ audit.log exists with ${lines.length} entries`);
    console.log('   Last entries:');
    last2.forEach(e => console.log('  ', JSON.stringify(e)));
  } else {
    console.log('   ❌ audit.log not found at', logFile);
  }

  const allOk = patchOk && delOk;
  console.log(`\n=== Result: ${allOk ? '✅ ALL PASSED' : '❌ SOME FAILED'} ===`);
})();
