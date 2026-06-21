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
