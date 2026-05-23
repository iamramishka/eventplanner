const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const weddings = await prisma.wedding.count();
    const guests = await prisma.guest.count();
    const rsvps = await prisma.guestRsvp.count();
    console.log('users:', users);
    console.log('weddings:', weddings);
    console.log('guests:', guests);
    console.log('guestRsvps:', rsvps);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
