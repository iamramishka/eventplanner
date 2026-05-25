import React from 'react';
import Link from 'next/link';
import './styles.css';

export const metadata = {
  title: 'WedPlan — Wedding Planning, Simplified',
  description: 'Plan, invite, and manage your wedding with beautiful templates, vendor discovery, and guest RSVPs.',
};

export default function PublicLanding() {
  return (
    <main className="public-landing">
      <div className="container">
        <header className="header">
          <div className="brand">WedPlan</div>
          <nav className="nav" aria-label="Primary navigation">
            <Link href="/vendors">Vendors</Link>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login" className="btn btn-ghost">Login</Link>
            <Link href="/register" className="btn btn-primary">Start Free Trial</Link>
          </nav>
        </header>

        <section className="hero" aria-label="Hero">
          <div className="hero-copy">
            <h1>Create wedding websites, manage guests, and plan together</h1>
            <p>Beautiful invitation templates, RSVP management, vendor discovery, and collaborative planning tools — all in one place.</p>
            <div style={{display:'flex',gap:'12px'}}>
              <Link href="/register" className="btn btn-primary">Start Free Trial</Link>
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
            <div className="templates-grid">
              <div className="template-card">
                <div className="template-thumb">Classic</div>
                <div>Classic serif wedding invitation</div>
              </div>

              <div className="template-card modern">
                <div className="template-thumb">Modern</div>
                <div className="template-desc">
                  <h3>Modern</h3>
                  <p className="muted">Clean, minimal layouts with bold imagery and clear CTAs.</p>
                  <ul>
                    <li>Responsive, grid-first design</li>
                    <li>Customizable font & color presets</li>
                    <li>Optimized for fast load & mobile</li>
                  </ul>
                </div>
                <div className="template-actions">
                  <Link href="/templates/modern" className="btn btn-ghost">Preview</Link>
                  <Link href="/register?template=modern" className="btn btn-primary">Use Template</Link>
                </div>
              </div>

              <div className="template-card">
                <div className="template-thumb">Romantic</div>
                <div>Soft colors and elegant spacing</div>
              </div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>Testimonials</h2>
            <div className="testimonials">
              <div className="testimonial"><div className="testimonial-quote">&quot;WedPlan made our day simple—guests RSVP&apos;d in minutes.&quot;</div><div className="testimonial-author">— Priya & Kasun</div></div>
              <div className="testimonial"><div className="testimonial-quote">&quot;Loved the vendor discovery—found our photographer locally.&quot;</div><div className="testimonial-author">— Maya & Sam</div></div>
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
                <Link href="/register" className="btn btn-primary">Start Free Trial</Link>
                <Link href="/pricing" className="btn btn-ghost">See Pricing</Link>
              </div>
            </div>
          </section>

          <section style={{marginTop:40}}>
            <h2>Trust & Testimonials</h2>
            <p>Trusted by couples and vendors worldwide.</p>
          </section>

          <footer style={{marginTop:40}}>
            <div className="footer-top">
              <p>Subscribe to our newsletter</p>
              <form style={{display:'flex',gap:8,marginTop:8}} onSubmit={e=>e.preventDefault()}>
                <input aria-label="Email" placeholder="Your email" style={{padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #e6e6e6'}} />
                <button className="btn btn-primary">Subscribe</button>
              </form>
            </div>

            <div style={{marginTop:24,borderTop:'1px solid rgba(0,0,0,0.06)',paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>© {new Date().getFullYear()} WedPlan</div>
              <div><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
