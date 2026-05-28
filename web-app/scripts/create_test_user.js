const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function main() {
  const prisma = new PrismaClient()
  const email = 'test+couple@local'
  const password = 'password123'
  const name = 'Test Couple'
  const role = 'COUPLE'

  const hashed = await bcrypt.hash(password, 10)

  // upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role },
    create: { email, name, password: hashed, role }
  })

  // create a wedding for the couple if none exists
  const existingWedding = await prisma.wedding.findFirst({ where: { userId: user.id } })
  if (!existingWedding) {
    await prisma.wedding.create({
      data: {
        userId: user.id,
        groomFirstName: 'TestGroom',
        brideFirstName: 'TestBride',
        slug: `test-couple-${Date.now()}`
      }
    })
  }

  console.log('Created/updated user:', { email: user.email, role: user.role })
  console.log('Password (plain for testing):', password)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
