import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import { Client } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  let urlInfo = { host: '', user: '', port: '' };
  try {
    const u = new URL(dbUrl);
    urlInfo = { host: u.hostname, user: u.username.slice(0, 12) + '...', port: u.port };
  } catch {
    urlInfo.host = 'parse-error';
  }

  let dnsResult = '';
  try {
    const addrs = await dns.lookup(urlInfo.host);
    dnsResult = JSON.stringify(addrs);
  } catch (e: unknown) {
    dnsResult = e instanceof Error ? e.message : String(e);
  }

  let pgResult = '';
  try {
    const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const res = await client.query('SELECT 1 AS ok');
    pgResult = JSON.stringify(res.rows[0]);
    await client.end();
  } catch (e: unknown) {
    pgResult = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({ urlInfo, dnsResult, pgResult });
}
