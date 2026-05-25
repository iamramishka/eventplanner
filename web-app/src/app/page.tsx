import LandingClient from './LandingClient';
import { getAdminSettings } from '@/lib/adminSettings';

export default function LandingPage() {
  const { settings } = getAdminSettings();

  if (settings.publicSite.maintenanceMode) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--inv-text-dark)', fontSize: 'clamp(2rem, 6vw, 4rem)' }}>{settings.branding.siteName}</h1>
          <p style={{ margin: '1rem auto 0', maxWidth: 560, color: 'var(--inv-text-soft)', lineHeight: 1.6 }}>
            We are updating the public site right now. Please check back shortly.
          </p>
          <p style={{ marginTop: 16, color: 'var(--inv-text-soft)' }}>{settings.contact.supportEmail}</p>
        </div>
      </main>
    );
  }

  return (
    <LandingClient
      heroTitle={settings.publicSite.heroTitle}
      heroSubtitle={settings.publicSite.heroSubtitle}
      ctaLabel={settings.publicSite.ctaLabel}
      ctaHref={settings.publicSite.ctaHref}
    />
  );
}
