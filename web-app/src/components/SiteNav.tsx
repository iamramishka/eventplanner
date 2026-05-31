'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Heart } from 'lucide-react';
import type { PlatformSettings } from '@/lib/adminSettings';

export default function SiteNav({ settings }: { settings?: PlatformSettings }) {
  const pathname = usePathname();
  const hiddenRoutes = ['/public-landing', '/login', '/register', '/find-event', '/sign-in'];
  const brandName = settings?.branding?.siteName || 'WedPlan';

  if (!pathname || pathname === '/' || hiddenRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <header style={{ borderBottom: '1px solid #e6e7eb', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, textDecoration: 'none', color: 'var(--brand-text, inherit)', fontFamily: 'var(--brand-font, inherit)' }}>
          <Heart size={18} color="var(--brand-mark)" aria-hidden="true" />
          {brandName}
        </Link>
        <nav style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
          <Link href="/vendors" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Vendors</Link>
          <Link href="/shortlist" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Shortlist</Link>
        </nav>
      </div>
      <div>
        <Link href="/login" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Sign in</Link>
      </div>
    </header>
  );
}
