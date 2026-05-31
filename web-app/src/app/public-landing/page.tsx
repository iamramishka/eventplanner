import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Heart,
  Mail,
  Palette,
  Phone,
  Wallet,
  Eye,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import './styles.css';

export const metadata = {
  title: 'WedPlan — Wedding Planning, Simplified',
  description: 'Plan, invite, and manage your wedding with beautiful templates, vendor discovery, and guest RSVPs.',
};

const features = [
  { icon: Users, title: 'Guest Management', copy: 'Easily add guests, send invitations and track responses.' },
  { icon: Mail, title: 'Digital Invitations', copy: 'Beautiful invitation websites with your own domain.' },
  { icon: Phone, title: 'Seating & Tables', copy: 'Smart table planning and guest arrangement.' },
  { icon: ClipboardList, title: 'Checklist & Tasks', copy: 'Stay organized with smart checklists and reminders.' },
  { icon: Wallet, title: 'Budget Planner', copy: 'Track expenses and manage your budget.' },
  { icon: Store, title: 'Vendor Management', copy: 'Find, manage and collaborate with vendors.' },
];

const advantages = [
  { icon: Heart, title: 'All-in-One Platform', copy: 'Manage everything in one powerful dashboard.' },
  { icon: Bell, title: 'Real-time Updates', copy: 'Instant RSVP updates and live guest tracking.' },
  { icon: Palette, title: 'Customizable', copy: 'Personalize every detail to match your style.' },
  { icon: ShieldCheck, title: 'Secure & Reliable', copy: 'Your data is safe with enterprise-grade security.' },
  { icon: Phone, title: 'Mobile Friendly', copy: 'Access and manage your wedding on the go.' },
  { icon: HelpCircle, title: 'Dedicated Support', copy: "We're here to help you at every step." },
];

const stats = [
  { value: '1,250+', label: 'Happy Couples', icon: Heart },
  { value: '250K+', label: 'Invitations Sent', icon: Mail },
  { value: '180K+', label: 'RSVPs Collected', icon: CheckCircle2 },
  { value: '12K+', label: 'Vendors Listed', icon: Store },
  { value: '99.9%', label: 'Uptime & Reliability', icon: ShieldCheck },
];

const testimonials = [
  {
    quote: 'WedPlan made our wedding planning so easy. Everything was organized and stress-free.',
    name: 'Kavindu & Senali',
    detail: 'Married December 2024',
  },
  {
    quote: 'The invitation website is beautiful and our guests loved the experience.',
    name: 'Vishmi & Sanjana',
    detail: 'Married January 2025',
  },
  {
    quote: 'Seating arrangement and RSVP tracking saved us so much time.',
    name: 'James & Emily',
    detail: 'Married March 2025',
  },
];

export default function PublicLanding() {
  return (
    <main className="publicLanding">
      <header className="landingNav">
        <Link href="/" className="landingBrand" aria-label="WedPlan home">
          <span className="brandW">W</span>
          <span><strong>WedPlan</strong><small>Plan Beautiful. Celebrate Forever.</small></span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link className="active" href="/">Home</Link>
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#pricing">Pricing</a>
          <Link href="/vendors">Vendors</Link>
          <a href="#resources">Resources <ChevronDown size={12} /></a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="navActions">
          <Link className="loginBtn" href="/login">Login</Link>
          <Link className="trialBtn" href="/register"><Heart size={14} /> Start Free Trial</Link>
        </div>
      </header>

      <section className="heroSection">
        <div className="heroCopy">
          <div className="eyebrow"><Heart size={14} fill="currentColor" /> All-in-One Wedding Management System</div>
          <h1>Plan Every Moment.<br />Cherish Every <em>Memory.</em></h1>
          <p>WedPlan helps couples manage everything in one place: guests, RSVPs, websites, seating, vendors, checklist, and more. Beautiful planning. Stress-free celebration.</p>
          <div className="heroActions">
            <Link className="trialBtn heroBtn" href="/register"><Heart size={15} /> Start Free Trial</Link>
            <a className="demoBtn" href="#how-it-works"><Eye size={15} /> View Demo</a>
          </div>
          <div className="trustRow">
            <span><CheckCircle2 size={14} /> No credit card required</span>
            <span><CheckCircle2 size={14} /> 7-day free trial</span>
            <span><CheckCircle2 size={14} /> Easy to use</span>
            <span><CheckCircle2 size={14} /> Cancel anytime</span>
          </div>
        </div>
        <div className="heroVisual" aria-label="WedPlan dashboard and invitation preview">
          <div className="heroMockup" aria-hidden="true">
            <div className="mockupCard mockupCardMain">
              <div className="mockupBar"><span /><span /><span /></div>
              <div className="mockupRow"><strong>Guests</strong><em>248 confirmed</em></div>
              <div className="mockupRow"><strong>RSVPs</strong><em>189 / 248</em></div>
              <div className="mockupRow"><strong>Budget</strong><em>LKR 2.4M tracked</em></div>
              <div className="mockupProgress"><span style={{width:'76%'}} /></div>
            </div>
            <div className="mockupCard mockupCardInvite">
              <div className="mockupInviteHeart">♥</div>
              <div className="mockupInviteName">Priya &amp; Kasun</div>
              <div className="mockupInviteDate">15 August 2026</div>
              <div className="mockupInviteVenue">Grand Ballroom, Colombo</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="featureStrip" aria-label="Platform features">
        {features.map(({ icon: Icon, title, copy }) => (
          <article key={title}>
            <div><Icon size={24} /></div>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section id="how-it-works" className="stepsSection">
        <div className="sectionLabel">How it works</div>
        <h2>Plan Your <em>Dream Wedding</em> in 3 Simple Steps</h2>
        <div className="stepsGrid">
          {['Create Your Account', 'Manage Everything', 'Celebrate Beautifully'].map((step, index) => (
            <article key={step}>
              <div className="stepIcon">{index + 1}</div>
              <h3>{step}</h3>
              <p>{index === 0 ? 'Sign up in seconds and create your wedding.' : index === 1 ? 'Add guests, customize your website, plan tasks and seating.' : 'Share your invitation and enjoy every moment stress-free.'}</p>
            </article>
          ))}
        </div>
        <div className="stepsImagePlaceholder" aria-hidden="true">
          <div className="coupleCardVisual">
            <span className="coupleHeart">♥</span>
            <strong>Your perfect day awaits</strong>
          </div>
        </div>
      </section>

      <section id="templates" className="templatesSection">
        <div className="templatesCopy">
          <span>Beautiful templates</span>
          <h2>Stunning Invitation <em>Templates</em></h2>
          <p>Choose from a variety of elegant templates and make it yours.</p>
          <Link href="/register">Explore Templates</Link>
        </div>
        <div className="templateShowcase">
          <div className="templateStripMock" aria-label="Invitation template previews">
            {['Classic Rose','Garden Bloom','Golden Hour','Ivory Lace','Midnight Blue'].map((name) => (
              <div key={name} className="templateThumb"><span>{name}</span></div>
            ))}
          </div>
          <div className="templateDots" aria-hidden="true"><span /><span /><span className="active" /><span /></div>
        </div>
      </section>

      <section className="whySection">
        <div className="sectionLabel">Why couples choose WedPlan</div>
        <h2>Everything You Need for the <em>Perfect Wedding</em></h2>
        <div className="whyGrid">
          {advantages.map(({ icon: Icon, title, copy }) => (
            <article key={title}><Icon size={22} /><strong>{title}</strong><span>{copy}</span></article>
          ))}
        </div>
      </section>

      <section className="statsBand">
        {stats.map(({ icon: Icon, value, label }) => (
          <strong key={label}><Icon size={22} /><span>{value}<small>{label}</small></span></strong>
        ))}
      </section>

      <section className="testimonialSection">
        <div className="sectionLabel">Loved by couples</div>
        <h2>What Couples Say About <em>WedPlan</em></h2>
        <button className="testimonialArrow testimonialArrowLeft" aria-label="Previous testimonial">‹</button>
        <button className="testimonialArrow testimonialArrowRight" aria-label="Next testimonial">›</button>
        <div className="testimonialGrid">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name}>
              <div className="stars">★★★★★</div>
              <p>{`"${testimonial.quote}"`}</p>
              <div className="testimonialPerson">
                <span>{testimonial.name.slice(0, 1)}</span>
                <strong>{testimonial.name}<small>{testimonial.detail}</small></strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="resources" className="vendorLogos" aria-label="Trusted vendors">
        <div className="vendorLabel">Trusted by top wedding vendors</div>
        {['Royal Caterers', 'Dream Events', 'Blossom Florals', 'Glamour Studio', 'The Honeymoon', 'Capture Moments', 'Sound Waves', 'Cake Gallery'].map((vendor) => (
          <span key={vendor}>{vendor}</span>
        ))}
      </section>

      <section className="finalCta">
        <div>
          <h2>Ready to Plan Your Dream Wedding?</h2>
          <p>Join thousands of happy couples and start your journey today.</p>
        </div>
        <div className="finalCtaActions">
          <Link className="trialBtn" href="/register"><Heart size={15} /> Start Your Free Trial</Link>
          <span><CheckCircle2 size={12} /> 7-day free trial</span>
          <span><CheckCircle2 size={12} /> No credit card required</span>
          <span><CheckCircle2 size={12} /> Cancel anytime</span>
        </div>
      </section>

      <footer id="contact" className="landingFooter">
        <div>
          <Link className="landingBrand" href="/"><span className="brandW">W</span><span><strong>WedPlan</strong><small>Plan Beautiful. Celebrate Forever.</small></span></Link>
          <p>The all-in-one wedding management system for modern couples.</p>
          <div className="socialRow"><span>f</span><span>◎</span><span>in</span><span>▶</span></div>
        </div>
        <div><strong>Product</strong><a href="#features">Features</a><a href="#templates">Templates</a><a href="#pricing">Pricing</a><Link href="/vendors">Vendors</Link></div>
        <div><strong>Company</strong><a href="#about">About Us</a><a href="#resources">Blog</a><a href="#contact">Careers</a><a href="#contact">Contact</a></div>
        <div><strong>Resources</strong><a href="#resources">Help Center</a><a href="#resources">Guides</a><a href="#resources">FAQs</a><a href="#resources">Privacy Policy</a></div>
        <div><strong>Support</strong><span>support@wedplan.com</span><span>+94 77 123 4567</span><span>Colombo, Sri Lanka</span></div>
        <form>
          <strong>Newsletter</strong>
          <span>Get tips and updates about weddings and our new features.</span>
          <input aria-label="Email" placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </footer>
    </main>
  );
}
