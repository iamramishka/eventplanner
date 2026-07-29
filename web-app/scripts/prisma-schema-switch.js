/**
 * Switches schema.prisma based on DATABASE_URL:
 *   - Postgres URL  → copies schema_postgres.prisma (Supabase / Vercel)
 *   - Anything else → copies schema_sqlite.prisma   (local dev)
 * Runs during postinstall so the right schema is used for prisma generate.
 */
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

const schemaDir = path.join(__dirname, '..', 'prisma');
const target = path.join(schemaDir, 'schema.prisma');
const postgresSource = path.join(schemaDir, 'schema_postgres.prisma');
const sqliteSource  = path.join(schemaDir, 'schema_sqlite.prisma');

if (isPostgres) {
  fs.copyFileSync(postgresSource, target);
  console.log('✔ Switched schema.prisma → PostgreSQL (Supabase)');
} else {
  fs.copyFileSync(sqliteSource, target);
  console.log('✔ Switched schema.prisma → SQLite (local dev)');
}
