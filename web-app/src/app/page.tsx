import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Heart,
  Mail,
  MapPin,
  Search,
  Users,
  Wallet,
} from 'lucide-react';
import './public-landing/styles.css';

export const metadata = {
  title: 'WedPlan - Wedding Planning That Actually Works',
  description:
    'Create a wedding workspace, share digital invitations, collect RSVPs, plan seating, track budget, and keep guests informed from one practical dashboard.',
};

const primaryFeatures = [
  {
    icon: Mail,
    title: 'Digital invitations',
    copy: 'Publish a shareable invitation page with event details, gallery, map, agenda, and RSVP entry points.',
  },
  {
    icon: Users,
    title: 'Guest and RSVP tracking',
    copy: 'Manage guest records, RSVP status, meal details, and attendance updates from the couple dashboard.',
  },
  {
    icon: Users,
    title: 'Seating tools',
    copy: 'Create tables, assign guests, and let attendees find their table when the event page is enabled.',
  },
  {
    icon: Wallet,
    title: 'Budget planner',
    copy: 'Track wedding expenses and notes so planning decisions stay visible to the couple.',
  },
  {
    icon: ClipboardList,
    title: 'Checklist and agenda',
    copy: 'Use task lists and timeline items to keep the ceremony, reception, and planning work organized.',
  },
  {
    icon: Search,
    title: 'Find an event',
    copy: 'Guests can search by couple names, event code, or invitation link when they misplace the original URL.',
  },
];

const steps = [
  {
    title: 'Create the wedding workspace',
    copy: 'Register, add the couple details, and start filling in the information guests actually need.',
  },
  {
    title: 'Invite and organize guests',
    copy: 'Add guests, share the invitation link, collect RSVPs, and keep seating and table information aligned.',
  },
  {
    title: 'Share the live event page',
    copy: 'Send guests to a clean public invitation with the latest venue, agenda, RSVP, and find-table actions.',
  },
];

const proofPoints = [
  'Built around live routes in the current app',
  'No unused signup forms or simulated messaging promises',
  'Mobile-first guest experience',
  'Couple dashboard, invitation, RSVP, seating, budget, and vendors stay connected',
];

export default function Home() {
  return (
    <main className="publicLanding">
      <header className="landingNav">
        <Link href="/" className="landingBrand" aria-label="WedPlan home">
          <span className="brandMark"><Heart size={20} fill="currentColor" aria-hidden="true" /></span>
          <span>
            <strong>WedPlan</strong>
            <small>Plan clearly. Invite beautifully.</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/find-event">Find event</Link>
          <Link href="/vendors">Vendors</Link>
        </nav>
        <div className="navActions">
          <Link className="loginBtn" href="/login">Sign in</Link>
          <Link className="trialBtn" href="/register">Start free <ArrowRight size={15} /></Link>
        </div>
      </header>

      <section className="heroSection">
        <div className="heroCopy">
          <div className="eyebrow"><CheckCircle2 size={15} /> Practical wedding planning, from invite to RSVP</div>
          <h1>One calm place to plan the wedding and guide every guest.</h1>
          <p>
            WedPlan brings the couple dashboard, public invitation, RSVP collection, seating tools,
            budget tracking, checklist, agenda, gallery, and vendor browsing into one working product.
          </p>
          <div className="heroActions">
            <Link className="trialBtn heroBtn" href="/register">Start planning <ArrowRight size={16} /></Link>
            <Link className="demoBtn" href="/find-event"><Search size={16} /> Find an event</Link>
          </div>
          <div className="trustRow" aria-label="Product assurances">
            {proofPoints.map((point) => (
              <span key={point}><CheckCircle2 size={14} /> {point}</span>
            ))}
          </div>
        </div>

        <div className="heroVisual" aria-label="WedPlan dashboard and invitation preview">
          <div className="heroMockup">
            <div className="mockupCard mockupCardMain">
              <div className="mockupHeader">
                <span>Couple dashboard</span>
                <strong>Priya &amp; Kasun</strong>
              </div>
              <div className="mockupMetric">
                <Users size={16} />
                <span>Guests</span>
                <strong>Managed</strong>
              </div>
              <div className="mockupMetric">
                <CalendarCheck size={16} />
                <span>RSVPs</span>
                <strong>Tracked</strong>
              </div>
              <div className="mockupMetric">
                <Wallet size={16} />
                <span>Budget</span>
                <strong>Visible</strong>
              </div>
              <div className="mockupProgress" aria-hidden="true"><span /></div>
            </div>
            <div className="mockupCard mockupCardInvite">
              <div className="mockupInviteHeart"><Heart size={24} fill="currentColor" /></div>
              <div className="mockupInviteName">Priya &amp; Kasun</div>
              <div className="mockupInviteDate">15 August 2026</div>
              <div className="mockupInviteVenue"><MapPin size={13} /> Grand Ballroom, Colombo</div>
              <Link href="/priya-and-kasun">Preview invitation</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="featureSection" aria-labelledby="features-title">
        <div className="sectionIntro">
          <span className="sectionLabel">What works today</span>
          <h2 id="features-title">Useful tools for the full guest journey</h2>
          <p>Every feature below maps to an existing part of the app instead of marketing-only filler.</p>
        </div>
        <div className="featureGrid">
          {primaryFeatures.map(({ icon: Icon, title, copy }) => (
            <article key={title}>
              <div><Icon size={23} /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="stepsSection" aria-labelledby="steps-title">
        <div className="sectionIntro">
          <span className="sectionLabel">How it works</span>
          <h2 id="steps-title">From setup to celebration in three steady steps</h2>
        </div>
        <div className="stepsGrid">
          {steps.map((step, index) => (
            <article key={step.title}>
              <div className="stepIcon">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflowBand" aria-labelledby="workflow-title">
        <div>
          <span className="sectionLabel">Connected flow</span>
          <h2 id="workflow-title">Guests always have a next step.</h2>
          <p>
            Search for an event, open the invitation, RSVP with the right token, and find table
            information when the couple enables it. The page keeps the promise small and real.
          </p>
        </div>
        <div className="workflowList">
          <Link href="/find-event"><Search size={18} /> Search an event</Link>
          <Link href="/priya-and-kasun"><Mail size={18} /> View sample invitation</Link>
          <Link href="/vendors"><Heart size={18} /> Browse vendors</Link>
        </div>
      </section>

      <section className="finalCta">
        <div>
          <h2>Ready to build a wedding plan guests can actually use?</h2>
          <p>Start with the couple workspace, then share the public invitation when the details are ready.</p>
        </div>
        <div className="finalCtaActions">
          <Link className="trialBtn" href="/register">Create your workspace <ArrowRight size={15} /></Link>
          <Link className="demoBtn" href="/login">Sign in</Link>
        </div>
      </section>

      <footer className="landingFooter">
        <div>
          <Link className="landingBrand" href="/">
            <span className="brandMark"><Heart size={18} fill="currentColor" aria-hidden="true" /></span>
            <span><strong>WedPlan</strong><small>Plan clearly. Invite beautifully.</small></span>
          </Link>
          <p>Wedding planning software for couples who need working tools more than polished placeholders.</p>
        </div>
        <div>
          <strong>Product</strong>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/find-event">Find event</Link>
          <Link href="/vendors">Vendors</Link>
        </div>
        <div>
          <strong>Account</strong>
          <Link href="/register">Start free</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/sign-in">Alternate sign in</Link>
        </div>
        <div>
          <strong>Guest tools</strong>
          <Link href="/priya-and-kasun">Sample invitation</Link>
          <Link href="/find-event">Find invitation</Link>
          <Link href="/shortlist">Vendor shortlist</Link>
        </div>
      </footer>
    </main>
  );
}
