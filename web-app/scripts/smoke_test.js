const http = require('http');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const baseUrl = new URL(BASE);
const REQUEST_TIMEOUT_MS = 30000;

function expectedStatuses(route) {
  return Array.isArray(route.expectedStatus) ? route.expectedStatus : [route.expectedStatus];
}

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
    req.setTimeout(REQUEST_TIMEOUT_MS, () => { req.destroy(); resolve({ path, status: 'TIMEOUT' }); });
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

  const failures = results.filter((result, index) => !expectedStatuses(routes[index]).includes(result.status));
  if (failures.length) {
    console.log('\n=== Smoke Failures ===');
    failures.forEach(result => {
      console.log(`  ${result.path} expected ${expectedStatuses(routes[results.indexOf(result)]).join('/')} but got ${result.status}`);
    });
    process.exitCode = 1;
  }

  console.log('\n=== Env Check ===');
  const envKeys = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
  envKeys.forEach(k => {
    const match = envContent.match(new RegExp(`^${k}=(.*)`, 'm'));
    const value = match?.[1]?.trim() || process.env[k] || '';
    if (value) {
      // Mask sensitive values
      const masked = k === 'NEXTAUTH_SECRET' ? value.substring(0, 6) + '...<redacted>' :
                     k === 'DATABASE_URL' ? value.replace(/:\/\/.+?@/, '://<redacted>@') : value;
      console.log(`  ${k}=${masked}`);
    } else {
      console.log(`  ${k}=MISSING!`);
    }
  });

  console.log('\nSmoke test complete.');
})();
