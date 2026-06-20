'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Search } from 'lucide-react';
import type { PlatformSettings } from '@/lib/adminSettings';

export default function SiteNav({ settings }: { settings?: PlatformSettings }) {
  const pathname = usePathname();
  const hiddenRoutes = ['/', '/public-landing', '/login', '/register', '/find-event', '/sign-in'];
  const brandName = settings?.branding?.siteName || 'WedPlan';

  if (!pathname || hiddenRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <header className="siteNav">
      <style jsx>{`
        .siteNav {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          min-height: 64px;
          padding: 10px max(18px, calc((100% - 1180px) / 2));
          border-bottom: 1px solid #ece7e8;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
        }

        .brand,
        .brandGroup,
        .links,
        .actions {
          display: flex;
          align-items: center;
        }

        .brandGroup {
          min-width: 0;
          gap: 10px;
        }

        .brand {
          gap: 9px;
          color: var(--brand-text, #18181b);
          font-family: var(--brand-font, inherit);
          font-size: 17px;
          font-weight: 800;
          text-decoration: none;
        }

        .brandMark {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          color: var(--brand-mark, #be123c);
          background: #ffe4e6;
        }

        .links {
          gap: 8px;
          margin-left: 10px;
        }

        .links a,
        .actions a {
          display: inline-flex;
          min-height: 38px;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 8px;
          padding: 0 12px;
          color: #3f3f46;
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
        }

        .links a:hover,
        .links a:focus-visible,
        .actions a:hover,
        .actions a:focus-visible {
          color: #be123c;
          background: #fff1f2;
        }

        .actions {
          gap: 8px;
        }

        .actions .primary {
          color: white;
          background: #be123c;
        }

        .actions .primary:hover,
        .actions .primary:focus-visible {
          color: white;
          background: #9f1239;
        }

        @media (max-width: 720px) {
          .siteNav {
            position: static;
            flex-wrap: wrap;
            align-items: stretch;
          }

          .links,
          .brandGroup,
          .actions {
            width: 100%;
            margin-left: 0;
          }

          .brandGroup {
            flex-wrap: wrap;
          }

          .links {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      <div className="brandGroup">
        <Link href="/" className="brand">
          <span className="brandMark"><Heart size={18} fill="currentColor" aria-hidden="true" /></span>
          {brandName}
        </Link>
        <nav className="links" aria-label="Site navigation">
          <Link href="/vendors">Vendors</Link>
          <Link href="/shortlist">Shortlist</Link>
          <Link href="/find-event"><Search size={15} /> Find event</Link>
        </nav>
      </div>
      <div className="actions">
        <Link href="/login">Sign in</Link>
        <Link href="/register" className="primary">Start free</Link>
      </div>
    </header>
  );
}
