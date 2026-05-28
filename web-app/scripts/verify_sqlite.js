const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev_sqlite.db');
const prisma = new PrismaClient({
  datasources: { db: { url: 'file:' + dbPath } }
});

async function main() {
  const users = await prisma.user.count();
  const weddings = await prisma.wedding.count();
  const guests = await prisma.guest.count();
  const rsvps = await prisma.guestRsvp.count();
  console.log('=== SQLite Seed Verification ===');
  console.log('users:', users);
  console.log('weddings:', weddings);
  console.log('guests:', guests);
  console.log('guestRsvps:', rsvps);

  // List users with roles
  const userList = await prisma.user.findMany({ select: { email: true, role: true, name: true } });
  console.log('\nUser list:');
  userList.forEach(u => console.log(' -', u.email, '|', u.role, '|', u.name || '(no name)'));
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
