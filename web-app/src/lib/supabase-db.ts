// DB helpers — backed by Prisma for both local Docker Postgres and Supabase Postgres.
// Storage helpers still use Supabase Storage REST API.
import { prisma } from '@/lib/prisma';

// ── filter parsing ──────────────────────────────────────────────────────────
// Converts PostgREST-style filter values (e.g. "eq.abc123") to Prisma where clauses.
function parseFilters(filters: Record<string, string>): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(filters)) {
    if (val.startsWith('eq.')) {
      where[key] = val.slice(3);
    } else {
      where[key] = val;
    }
  }
  return where;
}

// Converts "id,name,email" → { id: true, name: true, email: true }
// Returns undefined (= select all) when select is '*'.
function parseSelect(select: string): Record<string, boolean> | undefined {
  if (select === '*') return undefined;
  return Object.fromEntries(select.split(',').map(f => [f.trim(), true]));
}

// Maps Supabase table name (PascalCase) to Prisma client delegate (camelCase).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function model(table: string): any {
  const key = table.charAt(0).toLowerCase() + table.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[key];
}

// Prisma returns Date objects for DateTime fields; callers expect ISO strings (old Supabase REST behaviour).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDates(val: any): any {
  if (val instanceof Date) return val.toISOString();
  if (Array.isArray(val)) return val.map(serializeDates);
  if (val !== null && typeof val === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: Record<string, any> = {};
    for (const k of Object.keys(val)) out[k] = serializeDates(val[k]);
    return out;
  }
  return val;
}

// ── DB operations ───────────────────────────────────────────────────────────

export async function dbSelect<T>(
  table: string,
  filters: Record<string, string> = {},
  select = '*',
  limit = 100,
): Promise<T[]> {
  const { order: orderRaw, ...rest } = filters;
  const selectClause = parseSelect(select);

  // Convert "columnName.asc" / "columnName.desc" → Prisma orderBy
  let orderBy: Record<string, string> | undefined;
  if (orderRaw) {
    const dotIdx = orderRaw.lastIndexOf('.');
    const col = orderRaw.slice(0, dotIdx);
    const dir = orderRaw.slice(dotIdx + 1) === 'desc' ? 'desc' : 'asc';
    orderBy = { [col]: dir };
  }

  const rows = await model(table).findMany({
    where: parseFilters(rest),
    ...(selectClause ? { select: selectClause } : {}),
    ...(orderBy ? { orderBy } : {}),
    take: limit,
  });
  return serializeDates(rows) as T[];
}

export async function dbInsert<T>(table: string, data: Record<string, unknown>): Promise<T> {
  return model(table).create({ data });
}

export async function dbDelete(
  table: string,
  filters: Record<string, string>,
): Promise<void> {
  await model(table).deleteMany({ where: parseFilters(filters) });
}

export async function dbUpdate(
  table: string,
  filters: Record<string, string>,
  data: Record<string, unknown>,
): Promise<void> {
  const where = parseFilters(filters);
  // Use update() for id-only filters — it handles @updatedAt automatically
  // and is the correct Prisma method for single-row primary-key updates.
  if ('id' in where && Object.keys(where).length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt: _ignored, ...rest } = data;
    await model(table).update({ where: { id: where.id }, data: rest });
  } else {
    await model(table).updateMany({ where, data });
  }
}

export async function dbUpsert<T>(
  table: string,
  data: Record<string, unknown>,
  onConflict: string,
): Promise<T> {
  const conflictValue = data[onConflict];
  return model(table).upsert({
    where: { [onConflict]: conflictValue },
    create: data,
    update: data,
  });
}

// ── Supabase Storage (kept as REST — not replicated locally) ────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const STORAGE_BUCKET = 'wedding-media';

function storageHeaders() {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/octet-stream',
  };
}

export async function storageUpload(
  objectPath: string,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Storage upload requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: { ...storageHeaders(), 'Content-Type': contentType, 'x-upsert': 'true' },
    body: bytes as unknown as BodyInit,
  });
  if (!res.ok) throw new Error(`storageUpload ${objectPath}: ${res.status} ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}

export async function storageDeleteByUrl(publicUrl: string): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const objectPath = publicUrl.slice(idx + marker.length);
  await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
}
