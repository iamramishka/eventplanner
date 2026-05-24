import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const body = await req.json()
  const { token, password } = body || {}
  if (!token || !password) return NextResponse.json({ ok: false, error: 'token and password required' }, { status: 400 })

  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret'
  let payload: any
  try {
    payload = jwt.verify(token, secret) as any
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid or expired token' }, { status: 400 })
  }

  const userId = payload.userId as string
  if (!userId) return NextResponse.json({ ok: false, error: 'invalid token payload' }, { status: 400 })

  const hashed = await bcrypt.hash(String(password), 10)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  return NextResponse.json({ ok: true })
}
