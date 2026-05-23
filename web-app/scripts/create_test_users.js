const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function upsertUser(prisma, email, password, name, role) {
  const hashed = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role },
    create: { email, name, password: hashed, role }
  })
}

async function main() {
  const prisma = new PrismaClient()

  const users = [
    { email: 'test+couple@local', password: 'password123', name: 'Test Couple', role: 'COUPLE' },
    { email: 'test+vendor@local', password: 'vendorpass', name: 'Test Vendor', role: 'VENDOR' },
    { email: 'test+super@local', password: 'superpass', name: 'Super Admin', role: 'SUPER_ADMIN' }
  ]

  for (const u of users) {
    await upsertUser(prisma, u.email, u.password, u.name, u.role)
    console.log('Upserted:', u.email, u.role)
  }

  // ensure at least one wedding exists for couple
  const couple = await prisma.user.findUnique({ where: { email: 'test+couple@local' } })
  if (couple) {
    const w = await prisma.wedding.findFirst({ where: { userId: couple.id } })
    if (!w) {
      await prisma.wedding.create({ data: { userId: couple.id, groomFirstName: 'TestGroom', brideFirstName: 'TestBride', slug: `test-couple-${Date.now()}` } })
      console.log('Created wedding for test couple')
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
