import { NextResponse } from 'next/server'
import { dbUpdate } from '@/lib/supabase-db'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcrypt'

type ResetPasswordPayload = JwtPayload & {
  userId?: string
}

export async function POST(req: Request) {
  const body = await req.json()
  const { token, password } = body || {}
  if (!token || !password) return NextResponse.json({ ok: false, error: 'token and password required' }, { status: 400 })

  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret'
  let payload: ResetPasswordPayload
  try {
    const verified = jwt.verify(token, secret)
    if (typeof verified === 'string') {
      return NextResponse.json({ ok: false, error: 'invalid token payload' }, { status: 400 })
    }
    payload = verified as ResetPasswordPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid or expired token' }, { status: 400 })
  }

  const userId = payload.userId
  if (!userId) return NextResponse.json({ ok: false, error: 'invalid token payload' }, { status: 400 })

  const hashed = await bcrypt.hash(String(password), 10)
  await dbUpdate('User', { id: `eq.${userId}` }, { password: hashed, updatedAt: new Date().toISOString() })

  return NextResponse.json({ ok: true })
}
