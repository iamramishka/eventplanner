import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  const body = await req.json()
  const email = body?.email as string | undefined
  if (!email) return NextResponse.json({ ok: false, error: 'email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  // Always return ok to avoid user enumeration
  if (!user) {
    console.log(`Password reset requested for non-existing email: ${email}`)
    return NextResponse.json({ ok: true })
  }

  const secret = process.env.NEXTAUTH_SECRET || 'dev-secret'
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '1h' })

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset?token=${token}`

  // In a real app: send email. For local/dev we'll log the URL.
  console.log(`Password reset link for ${email}: ${resetUrl}`)

  return NextResponse.json({ ok: true })
}
