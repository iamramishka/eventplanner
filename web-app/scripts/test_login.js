const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function test(email, password) {
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return console.log(email, '=> user not found')
    if (!user.password) return console.log(email, '=> no password set')
    const ok = await bcrypt.compare(password, user.password)
    console.log(email, '=>', ok ? `OK (role=${user.role})` : 'INVALID')
  } finally {
    await prisma.$disconnect()
  }
}

;(async () => {
  await test('test+couple@local', 'password123')
  await test('test+vendor@local', 'vendorpass')
  await test('test+super@local', 'superpass')
  await test('hello@priyakasun.com', 'password')
})().catch(e => { console.error(e); process.exit(1) })
