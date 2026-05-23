const http = require('http');

function checkRoute(path) {
  return new Promise((resolve) => {
    const options = { hostname: 'localhost', port: 3000, path, method: 'GET' };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          location: res.headers.location || null,
          bodyPreview: body.substring(0, 300),
          hasError: body.includes('Error') || body.includes('SyntaxError') || body.includes('ModuleBuildError')
        });
      });
    });
    req.on('error', (e) => resolve({ path, status: 'ERROR', error: e.message }));
    req.setTimeout(15000, () => { req.destroy(); resolve({ path, status: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  console.log('=== Route Check ===');
  // First hit /super directly to trigger compilation
  const r1 = await checkRoute('/super');
  console.log(`/super => ${r1.status}${r1.location ? ' -> ' + r1.location : ''}`);
  if (r1.status === 307 || r1.status === 302) {
    console.log('  ✅ Middleware redirect working (unauthenticated)');
  } else if (r1.hasError) {
    console.log('  ❌ ERROR in response body');
    console.log('  Body:', r1.bodyPreview);
  } else {
    console.log('  Status:', r1.status);
  }
})();
