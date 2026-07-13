import pg from 'pg';
const { Client } = pg;

const SQL = `
ALTER TABLE "Wedding"
  ADD COLUMN IF NOT EXISTS "eventTime" text,
  ADD COLUMN IF NOT EXISTS "venueAddress" text,
  ADD COLUMN IF NOT EXISTS "venueMapLink" text,
  ADD COLUMN IF NOT EXISTS "rsvpDeadline" date,
  ADD COLUMN IF NOT EXISTS "specialNoteText" text;
`;

// Try pooler first, then direct connection as fallback
const CONNECTIONS = [
  {
    label: 'pooler (port 6543)',
    connectionString: 'postgresql://postgres.rfkxrtovvukikxqsyvyl:WedPlan2026Secure@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
    ssl: true,
  },
  {
    label: 'pooler session mode (port 5432 pooler)',
    connectionString: 'postgresql://postgres.rfkxrtovvukikxqsyvyl:WedPlan2026Secure@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
    ssl: true,
  },
  {
    label: 'direct DB',
    connectionString: 'postgresql://postgres:WedPlan2026Secure@db.rfkxrtovvukikxqsyvyl.supabase.co:5432/postgres',
    ssl: true,
  },
];

let success = false;
for (const cfg of CONNECTIONS) {
  console.log(`Trying ${cfg.label}…`);
  const client = new Client({ connectionString: cfg.connectionString, ssl: cfg.ssl, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log(`  Connected via ${cfg.label}.`);
    await client.query(SQL);
    console.log('Migration complete — all 5 columns added.');
    success = true;
    await client.end();
    break;
  } catch (err) {
    console.error(`  Failed (${cfg.label}): ${err.message}`);
    try { await client.end(); } catch { /* ignore */ }
  }
}

if (!success) {
  console.error('All connection attempts failed.');
  process.exit(1);
}
