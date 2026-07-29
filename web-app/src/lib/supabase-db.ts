// Thin REST wrapper over Supabase PostgREST — used instead of Prisma wire protocol.
// The Prisma Supavisor pooler is not configured for this project; REST API works fine.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function headers() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

export async function dbSelect<T>(
  table: string,
  filters: Record<string, string> = {},
  select = '*',
  limit = 100,
): Promise<T[]> {
  const params = new URLSearchParams({ select, limit: String(limit) });
  for (const [k, v] of Object.entries(filters)) params.set(k, v);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: headers() });
  if (!res.ok) throw new Error(`dbSelect ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function dbInsert<T>(table: string, data: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`dbInsert ${table}: ${res.status} ${await res.text()}`);
  const rows: T[] = await res.json();
  return rows[0];
}

export async function dbDelete(
  table: string,
  filters: Record<string, string>,
): Promise<void> {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error(`dbDelete ${table}: ${res.status} ${await res.text()}`);
}

export async function dbUpdate(
  table: string,
  filters: Record<string, string>,
  data: Record<string, unknown>,
): Promise<void> {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`dbUpdate ${table}: ${res.status} ${await res.text()}`);
}

// ── Supabase Storage (wedding-media bucket) ──
const STORAGE_BUCKET = 'wedding-media';

/**
 * Upload raw image bytes to the public wedding-media bucket and return the public URL.
 * `objectPath` is the path within the bucket, e.g. "gallery/<weddingId>/<file>.jpg".
 */
export async function storageUpload(
  objectPath: string,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: bytes as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`storageUpload ${objectPath}: ${res.status} ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}

/** Remove an object from the bucket given its public URL (best-effort). */
export async function storageDeleteByUrl(publicUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const objectPath = publicUrl.slice(idx + marker.length);
  await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
}
