import { spawn } from 'node:child_process';
import { encode } from 'next-auth/jwt';

const PORT = Number(process.env.RBAC_TEST_PORT || 3210);
const SECRET = process.env.NEXTAUTH_SECRET || 'rbac-smoke-secret';
const BASE_URL = `http://127.0.0.1:${PORT}`;

const checks = [];

function pushCheck(name, pass, detail) {
  checks.push({ name, pass, detail });
  const marker = pass ? 'PASS' : 'FAIL';
  console.log(`${marker} ${name}: ${detail}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function token(payload) {
  return encode({
    token: {
      ...payload,
      sub: payload.id,
    },
    secret: SECRET,
    maxAge: 3600,
  });
}

function withSession(sessionToken, options = {}) {
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: `next-auth.session-token=${sessionToken}`,
    },
  };
}

async function waitForServer() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/api/vendors/vnd_seed_001`);
      if (response.status) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Server did not become ready at ${BASE_URL}`);
}

async function stopServer(server) {
  if (!server.pid) return;
  await new Promise((resolve) => {
    const killer = spawn('taskkill.exe', ['/pid', String(server.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    killer.on('exit', resolve);
    killer.on('error', resolve);
  });
}

async function main() {
  let vendorToken;
  let ownerCoupleToken;
  let tableId;
  let galleryId;
  let listingId;

  const server = spawn('cmd.exe', ['/c', `npm.cmd run start -- -p ${PORT}`], {
    env: {
      ...process.env,
      NEXTAUTH_SECRET: SECRET,
      NEXTAUTH_URL: BASE_URL,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForServer();

    vendorToken = await token({
      id: 'u_vendor',
      email: 'hello@luminastudios.lk',
      role: 'VENDOR',
    });
    const wrongVendorToken = await token({
      id: 'u_vendor_other',
      email: 'other-vendor@example.com',
      role: 'VENDOR',
    });
    ownerCoupleToken = await token({
      id: 'u_couple_1',
      email: 'hello@priyakasun.com',
      role: 'COUPLE',
    });
    const wrongCoupleToken = await token({
      id: 'u_other',
      email: 'other@example.com',
      role: 'COUPLE',
    });
    const adminToken = await token({
      id: 'u_admin',
      email: 'admin@example.com',
      role: 'SUPER_ADMIN',
    });

    const unauthGuests = await request('/api/guests?weddingId=w_1');
    pushCheck('Unauthenticated couple API is blocked', unauthGuests.status === 401, `status ${unauthGuests.status}`);

    const unauthAdmin = await request('/api/admin/vendors');
    pushCheck('Unauthenticated admin API is blocked', unauthAdmin.status === 401, `status ${unauthAdmin.status}`);

    const publicRsvp = await request('/api/rsvp/token_g2');
    pushCheck('Public RSVP token access remains available', publicRsvp.status === 200, `status ${publicRsvp.status}`);

    const publicRsvpTable = await request('/api/rsvp/token_g2/table');
    pushCheck('Public RSVP table access remains available', publicRsvpTable.status === 200, `status ${publicRsvpTable.status}`);

    const wrongRole = await request('/api/weddings/w_1', withSession(vendorToken));
    pushCheck('Wrong role is blocked from couple resource', wrongRole.status === 403, `status ${wrongRole.status}`);

    const wrongOwner = await request('/api/weddings/w_1', withSession(wrongCoupleToken));
    pushCheck('Wrong couple owner is blocked', wrongOwner.status === 403, `status ${wrongOwner.status}`);

    const ownerWedding = await request('/api/weddings/w_1', withSession(ownerCoupleToken));
    pushCheck('Owning couple can access own wedding', ownerWedding.status === 200, `status ${ownerWedding.status}`);

    const ownerGuests = await request('/api/guests?weddingId=w_1', withSession(ownerCoupleToken));
    pushCheck('Owning couple can access own guests', ownerGuests.status === 200, `status ${ownerGuests.status}`);

    const wrongOwnerGuest = await request('/api/guests/g_1', withSession(wrongCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'wrong owner attempt' }),
    }));
    pushCheck('Wrong couple owner is blocked from guest mutation', wrongOwnerGuest.status === 403, `status ${wrongOwnerGuest.status}`);

    const ownerGuest = await request('/api/guests/g_1', withSession(ownerCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'owner update' }),
    }));
    pushCheck('Owning couple can mutate own guest', ownerGuest.status === 200, `status ${ownerGuest.status}`);

    const wrongOwnerRsvp = await request('/api/rsvps/r_1', withSession(wrongCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'wrong owner attempt' }),
    }));
    pushCheck('Wrong couple owner is blocked from RSVP mutation', wrongOwnerRsvp.status === 403, `status ${wrongOwnerRsvp.status}`);

    const ownerRsvp = await request('/api/rsvps/r_1', withSession(ownerCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'owner update' }),
    }));
    pushCheck('Owning couple can mutate own RSVP', ownerRsvp.status === 200, `status ${ownerRsvp.status}`);

    const wrongOwnerBudget = await request('/api/budget/b_1', withSession(wrongCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'wrong owner attempt' }),
    }));
    pushCheck('Wrong couple owner is blocked from budget mutation', wrongOwnerBudget.status === 403, `status ${wrongOwnerBudget.status}`);

    const ownerBudget = await request('/api/budget/b_1', withSession(ownerCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'owner update' }),
    }));
    pushCheck('Owning couple can mutate own budget item', ownerBudget.status === 200, `status ${ownerBudget.status}`);

    const wrongOwnerChecklist = await request('/api/checklist/cl_1', withSession(wrongCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: false }),
    }));
    pushCheck('Wrong couple owner is blocked from checklist mutation', wrongOwnerChecklist.status === 403, `status ${wrongOwnerChecklist.status}`);

    const ownerChecklist = await request('/api/checklist/cl_1', withSession(ownerCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: true }),
    }));
    pushCheck('Owning couple can mutate own checklist item', ownerChecklist.status === 200, `status ${ownerChecklist.status}`);

    const wrongOwnerAgenda = await request('/api/agenda/a_1', withSession(wrongCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'wrong owner attempt' }),
    }));
    pushCheck('Wrong couple owner is blocked from agenda mutation', wrongOwnerAgenda.status === 403, `status ${wrongOwnerAgenda.status}`);

    const ownerAgenda = await request('/api/agenda/a_1', withSession(ownerCoupleToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'owner update' }),
    }));
    pushCheck('Owning couple can mutate own agenda item', ownerAgenda.status === 200, `status ${ownerAgenda.status}`);

    const wrongOwnerTables = await request('/api/weddings/w_1/tables', withSession(wrongCoupleToken));
    pushCheck('Wrong couple owner is blocked from tables list', wrongOwnerTables.status === 403, `status ${wrongOwnerTables.status}`);

    const ownerTableCreate = await request('/api/weddings/w_1/tables', withSession(ownerCoupleToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'RBAC Test Table', capacity: 8 }),
    }));
    tableId = ownerTableCreate.body?.data?.id;
    pushCheck('Owning couple can create own table', ownerTableCreate.status === 200 && Boolean(tableId), `status ${ownerTableCreate.status}`);

    if (tableId) {
      const wrongOwnerTable = await request(`/api/weddings/w_1/tables/${tableId}`, withSession(wrongCoupleToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Wrong Owner Table' }),
      }));
      pushCheck('Wrong couple owner is blocked from table mutation', wrongOwnerTable.status === 403, `status ${wrongOwnerTable.status}`);

      const ownerTable = await request(`/api/weddings/w_1/tables/${tableId}`, withSession(ownerCoupleToken, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Owner Table Update' }),
      }));
      pushCheck('Owning couple can mutate own table', ownerTable.status === 200, `status ${ownerTable.status}`);

      const ownerTableDelete = await request(`/api/weddings/w_1/tables/${tableId}`, withSession(ownerCoupleToken, {
        method: 'DELETE',
      }));
      pushCheck('Owning couple can delete own table', ownerTableDelete.status === 200, `status ${ownerTableDelete.status}`);
      tableId = undefined;
    }

    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
    const ownerGalleryCreate = await request('/api/weddings/w_1/gallery', withSession(ownerCoupleToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: onePixelPng, fileName: 'rbac-test.png', altText: 'RBAC test' }),
    }));
    galleryId = ownerGalleryCreate.body?.id;
    pushCheck('Owning couple can create own gallery image', ownerGalleryCreate.status === 201 && Boolean(galleryId), `status ${ownerGalleryCreate.status}`);

    if (galleryId) {
      const wrongOwnerGallery = await request(`/api/gallery/${galleryId}`, withSession(wrongCoupleToken, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: 'wrong owner attempt' }),
      }));
      pushCheck('Wrong couple owner is blocked from gallery mutation', wrongOwnerGallery.status === 403, `status ${wrongOwnerGallery.status}`);

      const ownerGallery = await request(`/api/gallery/${galleryId}`, withSession(ownerCoupleToken, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: 'owner update' }),
      }));
      pushCheck('Owning couple can mutate own gallery image', ownerGallery.status === 200, `status ${ownerGallery.status}`);

      const ownerGalleryDelete = await request(`/api/gallery/${galleryId}`, withSession(ownerCoupleToken, {
        method: 'DELETE',
      }));
      pushCheck('Owning couple can delete own gallery image', ownerGalleryDelete.status === 200, `status ${ownerGalleryDelete.status}`);
      galleryId = undefined;
    }

    const admin = await request('/api/admin/vendors', withSession(adminToken));
    pushCheck('SUPER_ADMIN can access admin vendors', admin.status === 200, `status ${admin.status}`);

    const coupleAdmin = await request('/api/admin/vendors', withSession(ownerCoupleToken));
    pushCheck('COUPLE role is blocked from admin vendors', coupleAdmin.status === 403, `status ${coupleAdmin.status}`);

    const vendorGet = await request('/api/vendors/vnd_seed_001');
    pushCheck('Public vendor read remains available', vendorGet.status === 200, `status ${vendorGet.status}`);

    const unauthVendorMutation = await request('/api/vendors/vnd_seed_001', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+94 77 123 4567' }),
    });
    pushCheck('Unauthenticated vendor mutation is blocked', unauthVendorMutation.status === 401, `status ${unauthVendorMutation.status}`);

    const wrongVendorMutation = await request('/api/vendors/vnd_seed_001', withSession(wrongVendorToken, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+94 77 123 4567' }),
    }));
    pushCheck('Wrong vendor owner is blocked', wrongVendorMutation.status === 403, `status ${wrongVendorMutation.status}`);

    const ownerMutation = await request('/api/vendors/vnd_seed_001', withSession(vendorToken, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+94 77 123 4567' }),
    }));
    pushCheck('Vendor owner can mutate own vendor profile', ownerMutation.status === 200, `status ${ownerMutation.status}`);

    const wrongVendorListing = await request('/api/vendors/vnd_seed_001/listings/lst_seed_001', withSession(wrongVendorToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    }));
    pushCheck('Wrong vendor owner is blocked from listing mutation', wrongVendorListing.status === 403, `status ${wrongVendorListing.status}`);

    const ownerListing = await request('/api/vendors/vnd_seed_001/listings/lst_seed_001', withSession(vendorToken, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true }),
    }));
    pushCheck('Vendor owner can mutate own listing', ownerListing.status === 200, `status ${ownerListing.status}`);

    const listingPayload = {
      title: 'RBAC Test Listing',
      category: 'Photography',
      subcategory: 'Wedding Photography',
      description: 'Temporary listing created by the RBAC smoke test.',
      price: 12000,
      currency: 'LKR',
      pricingType: 'fixed',
    };

    const wrongVendorListingCreate = await request('/api/vendors/vnd_seed_001/listings', withSession(wrongVendorToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingPayload),
    }));
    pushCheck('Wrong vendor owner is blocked from listing creation', wrongVendorListingCreate.status === 403, `status ${wrongVendorListingCreate.status}`);

    const ownerListingCreate = await request('/api/vendors/vnd_seed_001/listings', withSession(vendorToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingPayload),
    }));
    listingId = ownerListingCreate.body?.listing?.id;
    pushCheck('Vendor owner can create own listing', ownerListingCreate.status === 201 && Boolean(listingId), `status ${ownerListingCreate.status}`);

    if (listingId) {
      const ownerListingDelete = await request(`/api/vendors/vnd_seed_001/listings/${listingId}`, withSession(vendorToken, {
        method: 'DELETE',
      }));
      pushCheck('Vendor owner can delete own listing', ownerListingDelete.status === 200, `status ${ownerListingDelete.status}`);
      listingId = undefined;
    }
  } finally {
    if (ownerCoupleToken && tableId) {
      await request(`/api/weddings/w_1/tables/${tableId}`, withSession(ownerCoupleToken, { method: 'DELETE' })).catch(() => {});
    }
    if (ownerCoupleToken && galleryId) {
      await request(`/api/gallery/${galleryId}`, withSession(ownerCoupleToken, { method: 'DELETE' })).catch(() => {});
    }
    if (vendorToken && listingId) {
      await request(`/api/vendors/vnd_seed_001/listings/${listingId}`, withSession(vendorToken, { method: 'DELETE' })).catch(() => {});
    }
    await stopServer(server);
  }

  const failed = checks.filter((check) => !check.pass);
  if (failed.length) {
    console.error(output);
    throw new Error(`${failed.length} RBAC check(s) failed`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
