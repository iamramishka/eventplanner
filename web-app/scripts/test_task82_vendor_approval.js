const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(method, path, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(base + path, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, ok: res.ok, text, json };
}

async function createVendor() {
  const payload = {
    ownerFirstName: 'Test', ownerLastName: 'Reviewer', email: `test+${Date.now()}@example.com`, phone: '+1000000000', passwordHash: '[placeholder]',
    businessName: `Test Vendor ${Date.now()}`, category: 'Catering', subcategory: 'Wedding Catering', description: 'Smoke test vendor',
    yearsInBusiness: 1, website: '', location: 'Test City', serviceArea: 'Local', logoBase64: null, portfolioImages: [],
    businessRegNumber: '', taxIdNumber: '', businessRegDocBase64: null, basePrice: 100, currency: 'USD', pricingNotes: '', packages: []
  };
  const res = await request('POST', '/api/admin/vendors', payload);
  assert(res.status === 201 && res.json?.data?.vendor?.id, `create vendor failed: ${res.status} ${res.text}`);
  return res.json.data.vendor;
}

async function reviewVendor(id, action) {
  const res = await request('POST', `/api/admin/vendors/${id}/review`, { action, notes: `automated ${action}`, reviewedBy: 'smoke-test' });
  return res;
}

async function getLogs(lines=20) {
  return request('GET', `/api/admin/logs?lines=${lines}`);
}

async function run() {
  console.log('Task 8.2 vendor approval smoke suite');
  console.log(`Base URL: ${base}`);

  const created = [];
  try {
    const v1 = await createVendor();
    created.push(v1.id);
    console.log('1. Created vendor', v1.id);

    let res = await reviewVendor(v1.id, 'approve');
    assert(res.status === 200 && res.json?.ok && res.json?.data?.vendor?.status === 'approved', `approve failed: ${res.status} ${res.text}`);
    console.log('2. Approved vendor, status now', res.json.data.vendor.status);

    const v2 = await createVendor();
    created.push(v2.id);
    console.log('3. Created vendor for rejection', v2.id);

    res = await reviewVendor(v2.id, 'reject');
    assert(res.status === 200 && res.json?.ok && res.json?.data?.vendor?.status === 'rejected', `reject failed: ${res.status} ${res.text}`);
    console.log('4. Rejected vendor, status now', res.json.data.vendor.status);

    const logs = await getLogs(10);
    assert(logs.status === 200 && logs.json?.ok, `logs fetch failed: ${logs.status} ${logs.text}`);
    const lines = logs.json.data.lines || [];
    const foundApprove = lines.some(l => l.action === 'vendor-approve' && l.targetId === v1.id);
    const foundReject = lines.some(l => l.action === 'vendor-reject' && l.targetId === v2.id);
    assert(foundApprove && foundReject, 'audit log entries not found for approve/reject');
    console.log('5. Audit log contains approve and reject entries');

    console.log('Task 8.2 vendor approval smoke suite passed.');
  } finally {
    // cleanup created vendors
    for (const id of created) {
      try { await request('DELETE', `/api/admin/vendors?id=${id}`); } catch {}
    }
    console.log('6. Cleaned up test vendors');
  }
}

run().catch(e => { console.error(e.message || e); process.exit(1); });
