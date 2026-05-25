'use client';

import Link from 'next/link';
import React from 'react';

export default function SiteNav({ settings }: any) {
  const brand = settings?.branding?.siteName || 'WedInvite';
  const logoUrl = settings?.branding?.logoUrl || '';
  const phone = settings?.contact?.phone || '';

  return (
    <header style={{ borderBottom: '1px solid #e6e7eb', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 16, textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {logoUrl && <img src={logoUrl} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />}
          {brand}
        </Link>
        <nav style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
          <Link href="/vendors" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Vendors</Link>
          <Link href="/shortlist" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Shortlist</Link>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {phone && <span style={{ color: '#64748b', fontSize: 13 }}>{phone}</span>}
        <Link href="/login" style={{ padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Sign in</Link>
      </div>
    </header>
  );
}
