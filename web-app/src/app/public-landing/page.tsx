import React from 'react';
import { Heart } from 'lucide-react';
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
          <div className="brand" aria-label="WedPlan">
            <span className="brand-mark"><Heart size={18} fill="currentColor" aria-hidden="true" /></span>
            <span>WedPlan</span>
          </div>
          <nav className="nav" aria-label="Primary navigation">
            <a href="/vendors">Vendors</a>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="/login" className="btn btn-ghost">Login</a>
            <a href="/register" className="btn btn-primary">Start Free Trial</a>
          </nav>
        </header>

        <section className="hero" aria-label="Hero">
          <div className="hero-copy">
            <h1>Create wedding websites, manage guests, and plan together</h1>
            <p>Beautiful invitation templates, RSVP management, vendor discovery, and collaborative planning tools — all in one place.</p>
            <div style={{display:'flex',gap:'12px'}}>
              <a href="/register" className="btn btn-primary">Start Free Trial</a>
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
                  <a href="/templates/modern" className="btn btn-ghost">Preview</a>
                  <a href="/register?template=modern" className="btn btn-primary">Use Template</a>
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
                <a href="/register" className="btn btn-primary">Start Free Trial</a>
                <a href="/pricing" className="btn btn-ghost">See Pricing</a>
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
              <form style={{display:'flex',gap:8,marginTop:8}}>
                <input aria-label="Email" placeholder="Your email" style={{padding:'0.6rem 0.8rem',borderRadius:8,border:'1px solid #e6e6e6'}} />
                <button type="button" className="btn btn-primary">Subscribe</button>
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
