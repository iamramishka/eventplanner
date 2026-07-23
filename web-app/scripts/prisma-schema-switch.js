/**
 * Copies schema_postgres.prisma → schema.prisma when DATABASE_URL is a Postgres URL.
 * Runs during Vercel build (buildCommand) so the right schema is used for prisma generate.
 */
const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

const schemaDir = path.join(__dirname, '..', 'prisma');
const target = path.join(schemaDir, 'schema.prisma');
const postgresSource = path.join(schemaDir, 'schema_postgres.prisma');

if (isPostgres) {
  fs.copyFileSync(postgresSource, target);
  console.log('✔ Switched schema.prisma → PostgreSQL (Supabase)');
} else {
  console.log('✔ Keeping schema.prisma → SQLite (local dev)');
}
