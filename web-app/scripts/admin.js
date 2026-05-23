#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function setPassword(email, password) {
  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { console.error('User not found'); await prisma.$disconnect(); process.exit(1) }
  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { email }, data: { password: hashed } })
  console.log('Password updated for', email)
  await prisma.$disconnect()
}

async function createUser(email, password, name, role='COUPLE') {
  const prisma = new PrismaClient()
  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email, password: hashed, name, role } })
  console.log('Created user', email)
  await prisma.$disconnect()
}

async function listUsers() {
  const prisma = new PrismaClient()
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, name: true } })
  users.forEach(u => console.log(u))
  await prisma.$disconnect()
}

const cmd = process.argv[2]
if (cmd === 'set-password') {
  const email = process.argv[3]; const password = process.argv[4]
  if (!email || !password) { console.error('Usage: set-password <email> <password>'); process.exit(1) }
  setPassword(email, password)
} else if (cmd === 'create-user') {
  const email = process.argv[3]; const password = process.argv[4]; const name = process.argv[5] || '' ; const role = process.argv[6] || 'COUPLE'
  if (!email || !password) { console.error('Usage: create-user <email> <password> [name] [role]'); process.exit(1) }
  createUser(email, password, name, role)
} else if (cmd === 'list') {
  listUsers()
} else {
  console.log('Admin CLI commands: set-password, create-user, list')
}
