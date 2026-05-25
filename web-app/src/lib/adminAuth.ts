import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

type SessionWithRole = {
  user?: {
    role?: string;
  };
};

export async function requireSuperAdmin() {
  if (process.env.NODE_ENV === 'development') return null;

  const session = await getServerSession(authOptions) as SessionWithRole | null;
  if (session?.user?.role === 'SUPER_ADMIN') return null;

  return NextResponse.json({ ok: false, error: 'super admin required' }, { status: 403 });
}
