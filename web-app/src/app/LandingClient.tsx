'use client';

import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Eye } from 'lucide-react';

type LandingClientProps = {
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function LandingClient({ heroTitle, heroSubtitle, ctaLabel, ctaHref }: LandingClientProps) {
  return (
    <main className="landing-main">
      <style jsx>{`
        .landing-main {
          min-height: 100vh;
          background: var(--inv-ivory); /* Soft blush */
          color: var(--inv-text-dark);
          overflow-x: hidden;
          font-family: var(--font-sans);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 1rem;
          position: relative;
        }

        /* Subtle floral/rose gradient background */
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(244, 166, 184, 0.15) 0%, transparent 60%),
                      radial-gradient(circle at bottom left, rgba(212, 175, 55, 0.08) 0%, transparent 50%);
          z-index: 0;
        }

        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: var(--weight-normal);
          color: var(--inv-text-dark); /* Deep burgundy */
          margin-bottom: 1rem;
          z-index: 2;
          line-height: 1.1;
        }

        .hero-title span {
          color: var(--inv-rose);
          font-style: italic;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--inv-text-soft);
          max-width: 650px;
          margin-bottom: 3rem;
          z-index: 2;
          font-weight: 300;
        }

        .btn-group {
          display: flex;
          gap: 1.5rem;
          z-index: 2;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--inv-rose);
          color: white;
          padding: 1rem 2.5rem;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 1.1rem;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(226, 75, 109, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          background: var(--inv-rose-dark);
          box-shadow: 0 12px 25px rgba(226, 75, 109, 0.4);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid var(--inv-rose-light);
          color: var(--inv-rose-dark);
          background: white;
          padding: 1rem 2.5rem;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 1.1rem;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #FFF0F3;
          border-color: var(--inv-rose);
        }

        .portals-section {
          padding: 6rem 1rem;
          background: white;
          border-top: 1px solid var(--adm-border);
        }

        .portals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 4rem auto 0;
        }

        .portal-card {
          background: white;
          border: 1px solid var(--adm-border);
          border-radius: var(--radius-2xl);
          padding: 2.5rem 2rem;
          transition: all 0.3s ease;
          position: relative;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .portal-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
          border-color: transparent;
        }

        .portal-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .card-invitation .portal-icon-wrapper { background: #FFF0F3; color: var(--inv-rose); }
        .card-couple .portal-icon-wrapper { background: #EEF2FF; color: #6366F1; }
        .card-admin .portal-icon-wrapper { background: #ECFDF5; color: #10B981; }
        .card-vendor .portal-icon-wrapper { background: #FEF2F2; color: #EF4444; }

        .portal-name {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--adm-text-primary);
          margin-bottom: 1rem;
        }

        .portal-desc {
          color: var(--adm-text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }
      `}</style>

      <section className="hero">
        <h1 className="hero-title">
          {heroTitle}
        </h1>
        <p className="hero-subtitle">
          {heroSubtitle}
        </p>
        <div className="btn-group">
          <Link href={ctaHref} className="btn-primary">
            <Eye size={20} /> {ctaLabel}
          </Link>
          <Link href="/couple" className="btn-outline">
            <LayoutDashboard size={20} /> Couple Dashboard
          </Link>
        </div>
      </section>

      <section className="portals-section">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--adm-text-primary)', marginBottom: '1rem' }}>
            One Complete Platform
          </h2>
          <p style={{ color: 'var(--adm-text-secondary)', fontSize: '1.1rem' }}>
            Four dedicated portals, seamlessly connected.
          </p>
        </div>

        <div className="portals-grid">
          <Link href="/priya-and-kasun" className="portal-card card-invitation">
            <div className="portal-icon-wrapper">
              <Eye size={28} />
            </div>
            <div className="portal-name">Public Invitation</div>
            <p className="portal-desc">The beautiful digital wedding invitation shared with guests. No login required.</p>
          </Link>

          <Link href="/couple" className="portal-card card-couple">
            <div className="portal-icon-wrapper">
              <LayoutDashboard size={28} />
            </div>
            <div className="portal-name">Couple Dashboard</div>
            <p className="portal-desc">The private workspace where couples manage every aspect of their wedding.</p>
          </Link>

          <Link href="/super" className="portal-card card-admin">
            <div className="portal-icon-wrapper">
              <ArrowRight size={28} />
            </div>
            <div className="portal-name">Super Admin Panel</div>
            <p className="portal-desc">Platform control center for monitoring users and system settings.</p>
          </Link>

          <Link href="/vendor" className="portal-card card-vendor">
            <div className="portal-icon-wrapper">
              <ArrowRight size={28} />
            </div>
            <div className="portal-name">Vendor Portal</div>
            <p className="portal-desc">Workspace for wedding vendors to manage listings and bookings.</p>
            <Link href="/vendor-register" style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#c45a74', fontWeight: 600, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>
              Register as a vendor →
            </Link>
          </Link>
        </div>
      </section>
    </main>
  );
}
