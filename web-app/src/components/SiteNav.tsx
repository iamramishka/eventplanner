'use client';

import Link from 'next/link';
import React from 'react';

export default function SiteNav() {
  return (
    <header style={{ borderBottom: '1px solid #e6e7eb', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: 16, textDecoration: 'none', color: 'inherit' }}>WedInvite</Link>
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
