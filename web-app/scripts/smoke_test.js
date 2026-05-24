const http = require('http');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const baseUrl = new URL(BASE);

// Check routes WITHOUT following redirects
async function checkRoute(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: baseUrl.hostname,
      port: baseUrl.port || (baseUrl.protocol === 'https:' ? 443 : 80),
      path: path,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      resolve({ path, status: res.statusCode, location: res.headers.location || null });
      res.resume(); // consume response
    });
    req.on('error', (e) => resolve({ path, status: 'ERROR', error: e.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ path, status: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  console.log('=== HTTP Smoke Tests (no redirect follow) ===');
  const results = [];

  const routes = [
    { path: '/', expectedStatus: 200 },
    { path: '/login', expectedStatus: 200 },
    { path: '/couple', expectedStatus: [307, 308, 302, 301, 200] }, // redirect to /login
    { path: '/vendor', expectedStatus: [307, 308, 302, 301, 200] },
    { path: '/super', expectedStatus: [307, 308, 302, 301, 200] },
    { path: '/api/auth/session', expectedStatus: 200 },
  ];

  for (const route of routes) {
    const r = await checkRoute(route.path);
    const redirect = r.location ? ` -> ${r.location}` : '';
    console.log(`  ${r.path} => ${r.status}${redirect}`);
    results.push(r);
  }

  console.log('\n=== Env Check ===');
  const envKeys = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const fs = require('fs');
  const envContent = fs.readFileSync('.env', 'utf8');
  envKeys.forEach(k => {
    const match = envContent.match(new RegExp(`^${k}=(.*)`, 'm'));
    if (match) {
      const val = match[1].trim();
      // Mask sensitive values
      const masked = k === 'NEXTAUTH_SECRET' ? val.substring(0, 6) + '...<redacted>' :
                     k === 'DATABASE_URL' ? val.replace(/:\/\/.+?@/, '://<redacted>@') : val;
      console.log(`  ${k}=${masked}`);
    } else {
      console.log(`  ${k}=MISSING!`);
    }
  });

  console.log('\nSmoke test complete.');
})();
