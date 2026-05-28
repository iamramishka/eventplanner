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
          headers: res.headers,
          bodyPreview: body.substring(0, 200)
        });
      });
    });
    req.on('error', (e) => resolve({ path, status: 'ERROR', error: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ path, status: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  const r = await checkRoute('/couple');
  console.log('Status:', r.status);
  console.log('Location:', r.location);
  console.log('Headers:', JSON.stringify(r.headers, null, 2));
  console.log('Body preview:', r.bodyPreview);
})();
