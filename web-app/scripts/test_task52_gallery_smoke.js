const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const weddingId = 'w_1';
const galleryPath = `/api/weddings/${weddingId}/gallery`;

const testPngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARLJgwiBqAAA2xQIFZC8qGQAAAABJRU5ErkJggg==';

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
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, text, json };
}

async function upload(label) {
  const res = await request('POST', galleryPath, {
    imageBase64: testPngDataUrl,
    altText: `${label} alt text`,
    fileName: `${label}.png`,
    width: 2,
    height: 2,
  });
  assert(res.status === 201, `upload ${label} expected 201, received ${res.status}: ${res.text}`);
  assert(res.json.id, `upload ${label} missing id`);
  assert(res.json.imageUrl.startsWith('/uploads/gallery/'), `upload ${label} missing gallery URL`);
  assert(res.json.mimeType === 'image/png', `upload ${label} did not persist mime type`);
  assert(res.json.sizeBytes > 0, `upload ${label} did not persist file size`);
  assert(res.json.width === 2 && res.json.height === 2, `upload ${label} did not persist dimensions`);
  return res.json;
}

async function cleanup(ids) {
  for (const id of ids) {
    await request('DELETE', `/api/gallery/${id}`);
  }
}

async function run() {
  console.log('Task 5.2 gallery smoke suite');
  console.log(`Base URL: ${base}`);

  const createdIds = [];
  try {
    let res = await request('GET', galleryPath);
    assert(res.status === 200 && Array.isArray(res.json), `initial gallery list failed: ${res.status}`);
    const initialIds = new Set(res.json.map(image => image.id));
    console.log(`1. Initial gallery list loaded (${res.json.length} images)`);

    const first = await upload(`task52-first-${Date.now()}`);
    createdIds.push(first.id);
    console.log('2. First image uploaded with metadata');

    res = await request('PATCH', `/api/gallery/${first.id}`, { altText: 'Updated Task 5.2 alt text' });
    assert(res.status === 200, `alt text update expected 200, received ${res.status}`);
    assert(res.json.altText === 'Updated Task 5.2 alt text', 'alt text did not persist');
    console.log('3. Alt text update persisted');

    const second = await upload(`task52-second-${Date.now()}`);
    createdIds.push(second.id);
    console.log('4. Second image uploaded');

    res = await request('GET', galleryPath);
    assert(res.status === 200, `gallery list after uploads failed: ${res.status}`);
    const smokeImages = res.json.filter(image => createdIds.includes(image.id));
    assert(smokeImages.length === 2, 'uploaded smoke images not both present');

    const reorderedIds = [
      second.id,
      first.id,
      ...res.json.map(image => image.id).filter(id => id !== second.id && id !== first.id),
    ];
    res = await request('PATCH', galleryPath, { orderedIds: reorderedIds });
    assert(res.status === 200, `reorder expected 200, received ${res.status}`);
    const firstIndex = res.json.findIndex(image => image.id === first.id);
    const secondIndex = res.json.findIndex(image => image.id === second.id);
    assert(secondIndex >= 0 && firstIndex >= 0 && secondIndex < firstIndex, 'reorder did not persist expected order');
    console.log('5. Reorder persisted sort order');

    res = await request('DELETE', `/api/gallery/${first.id}`);
    assert(res.status === 200, `delete expected 200, received ${res.status}`);
    createdIds.splice(createdIds.indexOf(first.id), 1);

    res = await request('GET', galleryPath);
    assert(res.status === 200, `gallery list after delete failed: ${res.status}`);
    assert(!res.json.some(image => image.id === first.id), 'deleted image still exists');
    assert(res.json.some(image => image.id === second.id), 'remaining image was lost after delete');
    assert(res.json.every(image => initialIds.has(image.id) || image.id === second.id), 'delete affected unrelated gallery images');
    console.log('6. Delete removed one image without data loss');
  } finally {
    await cleanup(createdIds);
    console.log('7. Cleaned up smoke-created gallery images');
  }

  console.log('Task 5.2 gallery smoke suite passed.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
