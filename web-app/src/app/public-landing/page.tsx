import React from 'react';
import './styles.css';
import { getAdminSettings } from '@/lib/adminSettings';

export function generateMetadata() {
  const { settings } = getAdminSettings();
  return {
    title: `${settings.branding.siteName} - Wedding Planning, Simplified`,
    description: settings.branding.publicTagline,
  };
}

export default function PublicLanding() {
  const { settings } = getAdminSettings();
  const brand = settings.branding.siteName;
  const publicSite = settings.publicSite;
  const cms = settings.cmsBlocks;
  const templates = settings.templates.filter((template) => template.status === 'active');

  if (publicSite.maintenanceMode) {
    return (
      <main className="public-landing">
        <div className="container" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <section>
            <h1>{brand}</h1>
            <p>{settings.branding.publicTagline}</p>
            <p>{settings.contact.supportEmail}</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="public-landing">
      <div className="container">
        <header className="header">
          <div className="brand">{brand}</div>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/vendors">Vendors</a>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="/login" className="btn btn-ghost">Login</a>
            <a href={publicSite.ctaHref} className="btn btn-primary">{publicSite.ctaLabel}</a>
          </nav>
        </header>

        <section className="hero" aria-label="Hero">
          <div className="hero-copy">
            <h1>{publicSite.heroTitle}</h1>
            <p>{publicSite.heroSubtitle}</p>
            <div style={{display:'flex',gap:'12px'}}>
              <a href={publicSite.ctaHref} className="btn btn-primary">{publicSite.ctaLabel}</a>
              <a href="#features" className="btn btn-ghost">See Features</a>
            </div>
          </div>

          <aside className="preview" aria-hidden="true">
            <img src="/Public Website/Public Website.png" alt="Landing preview" style={{width:'100%',borderRadius:'8px'}} />
          </aside>
        </section>

        <div className="sections">
          <section id="features">
            <h2>Features</h2>
            <p>{cms.featuresIntro}</p>
            <div className="feature-grid" style={{marginTop:16}}>
              <div className="feature-card"><h3>Invitation Templates</h3><p>Pick from elegant, responsive templates.</p></div>
              <div className="feature-card"><h3>Guest Management</h3><p>Import, segment, and manage RSVPs easily.</p></div>
              <div className="feature-card"><h3>Vendor Discovery</h3><p>Find trusted vendors and compare quotes.</p></div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>How it works</h2>
            <ol>
              <li>Create your wedding website</li>
              <li>Invite guests and track RSVPs</li>
              <li>Manage vendors and budgets</li>
            </ol>
          </section>

          <section style={{marginTop:40}}>
            <h2>Templates</h2>
            <p>{cms.templatesIntro}</p>
            <div className="templates-grid">
              {templates.map((template) => (
                <div className="template-card" key={template.id}>
                  <div className="template-thumb">{template.name}</div>
                  <div>{template.name} wedding invitation</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>Testimonials</h2>
            <div className="testimonials">
              <div className="testimonial"><div className="testimonial-quote">"WedPlan made our day simple—guests RSVP'd in minutes."</div><div className="testimonial-author">— Priya & Kasun</div></div>
              <div className="testimonial"><div className="testimonial-quote">"Loved the vendor discovery—found our photographer locally."</div><div className="testimonial-author">— Maya & Sam</div></div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>Trusted by vendors</h2>
            <div className="logos">
              <div className="logo">Vendor A</div>
              <div className="logo">Vendor B</div>
              <div className="logo">Vendor C</div>
              <div className="logo">Vendor D</div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <div className="final-cta">
              <h2>Start planning your wedding today</h2>
              <div style={{display:'flex',gap:12}}>
                <a href={publicSite.ctaHref} className="btn btn-primary">{publicSite.ctaLabel}</a>
                <a href="/pricing" className="btn btn-ghost">See Pricing</a>
              </div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>Trust & Testimonials</h2>
            <p>{cms.footerNote}</p>
          </section>

          <footer style={{marginTop:40}}>
            <div className="footer-top">
              <p>Subscribe to our newsletter</p>
              <form style={{display:'flex',gap:8,marginTop:8}}>
                <input aria-label="Email" placeholder="Your email" style={{padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #e6e6e6'}} />
                <button className="btn btn-primary">Subscribe</button>
              </form>
            </div>

            <div style={{marginTop:24,borderTop:'1px solid rgba(0,0,0,0.06)',paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>© {new Date().getFullYear()} WedPlan</div>
              <div><a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
