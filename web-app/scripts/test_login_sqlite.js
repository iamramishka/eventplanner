const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev_sqlite.db');
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:' + dbPath } }
});

async function test(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return console.log(email, '=> user not found');
  if (!user.password) return console.log(email, '=> no password set');
  const ok = await bcrypt.compare(password, user.password);
  console.log(email, '=>', ok ? `OK (role=${user.role})` : 'INVALID PASSWORD');
}

(async () => {
  console.log('=== Login Tests ===');
  await test('test+couple@local', 'password123');
  await test('test+vendor@local', 'vendorpass');
  await test('test+super@local', 'superpass');
  await test('hello@priyakasun.com', 'password');
})()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
