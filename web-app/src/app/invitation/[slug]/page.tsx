import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dbSelect } from '@/lib/supabase-db';
import { notFound } from 'next/navigation';
import { getInvitationContent, renderMarkdownBlocks } from '@/lib/invitation-content';
import CountdownTimer from './CountdownTimer';
import GalleryImageTile from './GalleryImageTile';
import { formatEventDateTime } from './invitation-date';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const DEFAULT_HERO = '/images/default-hero.jpg';

// ── Supabase row shapes ──
interface WeddingRow {
  id: string;
  slug: string;
  groomFirstName: string;
  brideFirstName: string;
  eventDate: string | null;
  venueName: string | null;
}
interface GalleryRow { id: string; imageType: string; imageUrl: string; sortOrder: number }
interface AgendaRow { id: string; title: string; eventTime: string | null; durationMinutes: number | null; description: string | null; iconKey: string | null; sortOrder: number }

const AGENDA_ICON_LABELS: Record<string, string> = {
  CalendarDays: '📅', Calendar: '📅', Clock: '⏰', Clock4: '⏰',
  GlassWater: '🥂', PartyPopper: '🎉', Music: '🎵', MapPin: '📍',
  Utensils: '🍽️', Camera: '📷', Gift: '🎁', Mic2: '🎤', Sparkles: '✨', Ring: '💍',
};

function agendaIcon(key?: string | null) {
  return AGENDA_ICON_LABELS[String(key || '').trim()] ?? '✦';
}

/** Extract HH:MM from an ISO/timestamp string. */
function timeFromTimestamp(ts?: string | null): string {
  if (!ts) return '';
  const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function addMinutes(ts: string | null, minutes: number | null): string {
  if (!ts || !minutes) return '';
  const d = new Date(ts.includes('T') ? ts : ts.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Returns the YYYY-MM-DD date portion of a timestamp. */
function dateOnly(ts?: string | null): string {
  if (!ts) return '';
  return ts.slice(0, 10);
}

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; }
}

async function loadWedding(slug: string) {
  const rows = await dbSelect<WeddingRow>('Wedding', { slug: `eq.${slug}` }, '*', 1);
  return rows[0] || null;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const wedding = await loadWedding(slug);
  if (!wedding) notFound();
  const title = `${wedding.brideFirstName} & ${wedding.groomFirstName}`;
  const description = `Join ${wedding.brideFirstName} and ${wedding.groomFirstName} on ${formatDate(dateOnly(wedding.eventDate))} at ${wedding.venueName || 'our celebration'}`;
  return {
    title, description,
    openGraph: { title, description, images: [{ url: `/invitation/${slug}/opengraph-image`, alt: title }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [`/invitation/${slug}/twitter-image`] },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const guestToken = typeof sp.token === 'string' ? sp.token : undefined;

  const wedding = await loadWedding(slug);
  if (!wedding) notFound();

  const brideName = wedding.brideFirstName;
  const groomName = wedding.groomFirstName;
  const date = dateOnly(wedding.eventDate);
  const venueName = wedding.venueName || '';
  const title = `${brideName} & ${groomName}`;
  const description = `Join ${brideName} and ${groomName} on ${formatDate(date)} at ${venueName || 'our celebration'}`;

  // Gallery + hero
  const allImages = await dbSelect<GalleryRow>(
    'GalleryImage',
    { weddingId: `eq.${wedding.id}`, order: 'sortOrder.asc' },
    '*',
    500,
  );
  const heroRow = allImages.find((img) => img.imageType === 'hero');
  const galleryImages = allImages.filter((img) => (img.imageType || 'gallery') === 'gallery');
  // Fallback chain: gallery hero → default
  const heroImage = heroRow?.imageUrl || DEFAULT_HERO;

  // Agenda
  const agenda = await dbSelect<AgendaRow>(
    'AgendaItem',
    { weddingId: `eq.${wedding.id}`, order: 'sortOrder.asc' },
    '*',
    200,
  );

  const content = getInvitationContent({ date, venueName });
  const messageBlocks = renderMarkdownBlocks(content.messageMarkdown);
  const detailsBlocks = renderMarkdownBlocks(content.detailsMarkdown);
  const eventLabel = formatEventDateTime(date, undefined, 'UTC');

  const primary = '#C45A74';
  const gold = '#C9A574';
  const sage = '#8FA98F';

  return (
    <>
      <style>{`
        :root {
          --inv-primary: ${primary};
          --inv-gold: ${gold};
          --inv-sage: ${sage};
          --inv-bg: #FCF8F6;
          --inv-surface: rgba(255,255,255,0.82);
          --inv-text: #2A1A1F;
          --inv-muted: #6b4a56;
          --inv-border: rgba(196,90,116,0.15);
          --inv-radius: 20px;
          --inv-shadow: 0 8px 32px rgba(100,50,70,0.10);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .inv-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--inv-bg);color:var(--inv-text);min-height:100vh;-webkit-font-smoothing:antialiased}

        /* ── Hero (full-bleed photo) ── */
        .inv-hero{
          position:relative;min-height:100svh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;overflow:hidden;
          padding:0 20px 80px;text-align:center;
        }
        .inv-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
        .inv-hero-overlay{
          position:absolute;inset:0;z-index:1;pointer-events:none;
          background:
            linear-gradient(to bottom, rgba(20,8,12,0.32) 0%, rgba(20,8,12,0.05) 32%, rgba(20,8,12,0.15) 60%, rgba(20,8,12,0.62) 100%);
        }
        .inv-hero > *{position:relative;z-index:2}
        .inv-hero-eyebrow{
          letter-spacing:.32em;text-transform:uppercase;font-size:.74rem;
          color:rgba(255,255,255,0.88);margin-bottom:18px;font-weight:500;
          text-shadow:0 1px 12px rgba(0,0,0,0.45);
        }
        .inv-hero-names{
          font-family:'Playfair Display',Georgia,serif;
          font-size:clamp(3.2rem,13vw,8.5rem);font-weight:500;line-height:.98;
          color:#fff;letter-spacing:-.01em;margin-bottom:18px;font-style:italic;
          text-shadow:0 2px 28px rgba(0,0,0,0.45);
        }
        .inv-hero-names .amp{
          display:inline-block;font-size:.7em;font-style:italic;
          color:var(--inv-gold);margin:0 .12em;
        }
        .inv-hero-sub{
          font-family:'Playfair Display',Georgia,serif;font-style:italic;
          font-size:clamp(1.1rem,3vw,1.6rem);color:rgba(255,255,255,0.92);
          margin-bottom:30px;text-shadow:0 1px 14px rgba(0,0,0,0.45);
        }
        .inv-hero-meta{
          display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:34px;
        }
        .inv-hero-meta-label{
          letter-spacing:.3em;text-transform:uppercase;font-size:.68rem;
          color:rgba(255,255,255,0.72);font-weight:500;
        }
        .inv-hero-date{
          font-family:'Playfair Display',Georgia,serif;
          font-size:clamp(1.6rem,5vw,2.6rem);color:#fff;font-weight:500;
          letter-spacing:.02em;text-shadow:0 2px 18px rgba(0,0,0,0.5);
        }
        .inv-hero-rule{width:60px;height:1px;background:rgba(255,255,255,0.5);margin:6px 0}
        .inv-hero-venue{
          font-size:clamp(.92rem,2.2vw,1.1rem);color:rgba(255,255,255,0.86);
          letter-spacing:.04em;text-shadow:0 1px 12px rgba(0,0,0,0.45);
        }
        .inv-hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
        .inv-btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 34px;border-radius:999px;
          background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 70%,var(--inv-gold)));
          color:#fff;text-decoration:none;font-size:.95rem;font-weight:600;
          letter-spacing:.02em;border:none;cursor:pointer;
          box-shadow:0 8px 28px rgba(196,90,116,0.45);
          transition:transform .15s,box-shadow .15s;
        }
        .inv-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(196,90,116,0.55)}
        .inv-btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 30px;border-radius:999px;
          background:rgba(255,255,255,0.16);backdrop-filter:blur(10px);
          color:#fff;text-decoration:none;font-size:.95rem;font-weight:500;
          border:1px solid rgba(255,255,255,0.5);
          transition:background .15s;
        }
        .inv-btn-secondary:hover{background:rgba(255,255,255,0.28)}
        .inv-scroll-hint{
          position:absolute;bottom:22px;left:50%;transform:translateX(-50%);
          z-index:2;display:flex;flex-direction:column;align-items:center;
          gap:8px;color:rgba(255,255,255,0.72);font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;
          text-shadow:0 1px 10px rgba(0,0,0,0.4);
        }
        .inv-scroll-hint::after{
          content:'';display:block;width:1px;height:34px;
          background:linear-gradient(to bottom,rgba(255,255,255,0.7),transparent);
        }

        /* ── Layout ── */
        .inv-body{max-width:840px;margin:0 auto;padding:64px 16px 80px;display:grid;gap:28px}
        @media(min-width:600px){.inv-body{padding:72px 32px 80px}}

        /* ── Cards ── */
        .inv-card{
          background:var(--inv-surface);backdrop-filter:blur(8px);
          border:1px solid var(--inv-border);border-radius:var(--inv-radius);
          box-shadow:var(--inv-shadow);padding:28px 24px;
        }
        .inv-section-label{
          letter-spacing:.3em;text-transform:uppercase;font-size:.68rem;
          color:var(--inv-primary);font-weight:600;margin-bottom:14px;
        }
        .inv-section-title{
          font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,5vw,2.6rem);
          font-weight:500;color:var(--inv-text);line-height:1.15;margin-bottom:12px;
        }
        .inv-section-body{color:var(--inv-muted);line-height:1.75;font-size:.97rem}

        /* ── Details strip ── */
        .inv-details-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
        .inv-detail-pill{
          display:flex;align-items:flex-start;gap:12px;
          padding:16px 18px;border-radius:14px;
          background:rgba(196,90,116,0.06);border:1px solid var(--inv-border);
        }
        .inv-detail-icon{font-size:1.3rem;flex-shrink:0;margin-top:2px}
        .inv-detail-label{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--inv-primary);font-weight:600;margin-bottom:4px}
        .inv-detail-value{font-size:.97rem;color:var(--inv-text);font-weight:500;line-height:1.4}

        /* ── Countdown ── */
        .inv-countdown-card{
          text-align:center;
          background:linear-gradient(135deg,rgba(196,90,116,0.08),rgba(201,165,116,0.10));
          border:1px solid rgba(201,165,116,0.25);
        }

        /* ── Story ── */
        .inv-story-card{padding:32px 28px;line-height:1.85}
        .inv-story-card p{color:var(--inv-muted);font-size:1rem;margin-bottom:1em}
        .inv-story-card h3{font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:500;color:var(--inv-text);margin-bottom:.6em}

        /* ── Agenda ── */
        .inv-agenda-track{display:grid;gap:0;position:relative;padding-left:40px}
        .inv-agenda-track::before{
          content:'';position:absolute;left:19px;top:24px;bottom:24px;width:2px;
          background:linear-gradient(to bottom,transparent,var(--inv-gold) 10%,var(--inv-gold) 90%,transparent);
          opacity:.4;
        }
        .inv-agenda-entry{display:grid;grid-template-columns:auto 1fr;gap:0 16px;padding-bottom:28px;position:relative}
        .inv-agenda-entry:last-child{padding-bottom:0}
        .inv-agenda-dot{
          width:40px;height:40px;border-radius:50%;
          background:#fff;border:2px solid var(--inv-gold);
          display:flex;align-items:center;justify-content:center;
          font-size:1.1rem;flex-shrink:0;box-shadow:0 4px 14px rgba(201,165,116,0.25);
          position:relative;z-index:1;
        }
        .inv-agenda-content{padding-top:8px;min-width:0}
        .inv-agenda-time{font-size:.8rem;color:var(--inv-primary);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px}
        .inv-agenda-title{font-size:1.05rem;font-weight:600;color:var(--inv-text);margin-bottom:4px}
        .inv-agenda-desc{font-size:.87rem;color:var(--inv-muted);line-height:1.6}

        /* ── Gallery ── */
        .inv-gallery-grid{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:520px){.inv-gallery-grid{grid-template-columns:repeat(3,1fr)}}
        .inv-gallery-grid > *:first-child{grid-column:1/-1}
        @media(min-width:520px){.inv-gallery-grid > *:first-child{grid-column:auto}}
        .inv-gallery-empty{
          min-height:200px;display:grid;place-items:center;text-align:center;
          padding:40px 24px;border-radius:16px;
          border:2px dashed rgba(196,90,116,0.20);background:rgba(196,90,116,0.04);
        }
        .inv-gallery-empty-icon{font-size:2.5rem;margin-bottom:12px;opacity:.4}
        .inv-gallery-empty-text{color:var(--inv-muted);font-size:.92rem;line-height:1.6}

        /* ── CTA banners ── */
        .inv-cta-banner{border-radius:var(--inv-radius);padding:36px 28px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px}
        .inv-cta-banner.rsvp{
          background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 60%,var(--inv-gold)));
          box-shadow:0 12px 40px rgba(196,90,116,0.35);
        }
        .inv-cta-banner.rsvp *{color:#fff}
        .inv-cta-banner.rsvp .inv-btn-primary{background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.40);box-shadow:none}
        .inv-cta-banner.rsvp .inv-btn-primary:hover{background:rgba(255,255,255,0.32)}
        .inv-cta-banner.table{background:var(--inv-surface);border:1px solid var(--inv-border)}
        .inv-cta-banner .inv-section-title{margin-bottom:8px}
        .inv-cta-banner .inv-section-body{max-width:480px}

        /* ── Footer ── */
        .inv-footer{text-align:center;padding:32px 16px 48px;border-top:1px solid var(--inv-border);color:var(--inv-muted);font-size:.82rem;line-height:1.7}
        .inv-footer a{color:var(--inv-primary);text-decoration:none}
        .inv-footer-brand{font-family:'Playfair Display',Georgia,serif;font-size:1.5rem;color:var(--inv-text);margin-bottom:8px;font-weight:500;font-style:italic}

        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      <div className="inv-root">

        {/* ─── HERO ─── */}
        <header className="inv-hero">
          <Image src={heroImage} alt={title} fill className="inv-hero-img" priority sizes="100vw" />
          <div className="inv-hero-overlay" aria-hidden="true" />
          <p className="inv-hero-eyebrow">Together with their families</p>
          <h1 className="inv-hero-names">
            {brideName}<span className="amp">&amp;</span>{groomName}
          </h1>
          <p className="inv-hero-sub">are getting married</p>
          <div className="inv-hero-meta">
            {date && <span className="inv-hero-meta-label">Join us on</span>}
            {date && <span className="inv-hero-date">{date}</span>}
            {date && venueName && <span className="inv-hero-rule" aria-hidden="true" />}
            {venueName && <span className="inv-hero-venue">{venueName}</span>}
          </div>
          <div className="inv-hero-ctas">
            <a href={guestToken ? `/rsvp/${guestToken}` : `#rsvp`} className="inv-btn-primary">✉ RSVP</a>
            <a href={`/find-table/${slug}`} className="inv-btn-secondary">🪑 Find My Seat</a>
          </div>
          <div className="inv-scroll-hint" aria-hidden="true">Scroll</div>
        </header>

        {/* ─── BODY ─── */}
        <div className="inv-body">

          {/* Event Details */}
          <section>
            <p className="inv-section-label">Event Details</p>
            <div className="inv-details-grid">
              {date && (
                <div className="inv-detail-pill">
                  <span className="inv-detail-icon">📅</span>
                  <div>
                    <p className="inv-detail-label">Date</p>
                    <p className="inv-detail-value">{formatDate(date)}</p>
                  </div>
                </div>
              )}
              {venueName && (
                <div className="inv-detail-pill">
                  <span className="inv-detail-icon">📍</span>
                  <div>
                    <p className="inv-detail-label">Venue</p>
                    <p className="inv-detail-value">{venueName}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Countdown */}
          {date && (
            <section className="inv-card inv-countdown-card">
              <p className="inv-section-label" style={{marginBottom:6}}>Counting down to</p>
              <h2 className="inv-section-title" style={{textAlign:'center',marginBottom:20}}>{eventLabel}</h2>
              <CountdownTimer date={date} timezone={'UTC'} />
            </section>
          )}

          {/* Message */}
          <section className="inv-card inv-story-card">
            <p className="inv-section-label">A message from us</p>
            {messageBlocks.map((block, i) => {
              if (block.type === 'heading') return <h3 key={i}>{block.text}</h3>;
              if (block.type === 'list') return (
                <ul key={i} style={{paddingLeft:'1.4em',color:'var(--inv-muted)',fontSize:'.97rem',lineHeight:1.75}}>
                  {(block.items || []).map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              );
              return <p key={i}>{block.text}</p>;
            })}
          </section>

          {/* Details / venue content */}
          {detailsBlocks.length > 0 && (
            <section className="inv-card inv-story-card">
              {detailsBlocks.map((block, i) => {
                if (block.type === 'heading') return <h3 key={i}>{block.text}</h3>;
                if (block.type === 'list') return (
                  <ul key={i} style={{paddingLeft:'1.4em',color:'var(--inv-muted)',fontSize:'.97rem',lineHeight:1.75}}>
                    {(block.items || []).map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
                );
                return <p key={i}>{block.text}</p>;
              })}
            </section>
          )}

          {/* Agenda */}
          {agenda.length > 0 && (
            <section className="inv-card" data-testid="public-agenda">
              <p className="inv-section-label">The day</p>
              <h2 className="inv-section-title">Day&apos;s Schedule</h2>
              <p className="inv-section-body" style={{marginBottom:28}}>
                The celebration timeline — we can&apos;t wait to share these moments with you.
              </p>
              <div className="inv-agenda-track" data-testid="public-agenda-list" role="list">
                {agenda.map((item) => {
                  const start = timeFromTimestamp(item.eventTime);
                  const end = addMinutes(item.eventTime, item.durationMinutes);
                  return (
                    <article key={item.id} className="inv-agenda-entry" data-testid="public-agenda-item" role="listitem">
                      <div className="inv-agenda-dot" data-testid="public-agenda-icon">{agendaIcon(item.iconKey)}</div>
                      <div className="inv-agenda-content">
                        <time className="inv-agenda-time" data-testid="public-agenda-time">
                          {formatTime(start)}{end ? ` – ${formatTime(end)}` : ''}
                        </time>
                        <h3 className="inv-agenda-title" data-testid="public-agenda-title">{item.title}</h3>
                        {item.description && <p className="inv-agenda-desc" data-testid="public-agenda-description">{item.description}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Gallery */}
          <section className="inv-card" data-testid="public-gallery">
            <p className="inv-section-label">Gallery</p>
            <h2 className="inv-section-title">Favourite Moments</h2>
            <p className="inv-section-body" style={{marginBottom:20}}>
              A few memories the couple has shared ahead of the celebration.
            </p>
            {galleryImages.length > 0 ? (
              <div className="inv-gallery-grid" data-testid="public-gallery-grid">
                {galleryImages.map((img) => (
                  <GalleryImageTile key={img.id} src={img.imageUrl} alt={'Wedding photo'} width={0} height={0} caption={''} />
                ))}
              </div>
            ) : (
              <div className="inv-gallery-empty" data-testid="public-gallery-empty">
                <div className="inv-gallery-empty-icon">🌸</div>
                <p className="inv-gallery-empty-text">
                  The couple will be adding their gallery soon.<br />
                  Please check back closer to the celebration.
                </p>
              </div>
            )}
          </section>

          {/* RSVP CTA */}
          <div className="inv-cta-banner rsvp" data-testid="public-rsvp-cta" id="rsvp">
            <h2 className="inv-section-title">We&apos;d love to know you&apos;re coming.</h2>
            <p className="inv-section-body">
              {guestToken
                ? 'Your response helps us prepare seating, meals, and a warm welcome for you and your family.'
                : 'Please use the personal link shared with you to RSVP, or contact the couple directly.'}
            </p>
            {guestToken ? (
              <a href={`/rsvp/${guestToken}`} className="inv-btn-primary">✉ Respond to Invitation</a>
            ) : (
              <p style={{color:'rgba(255,255,255,0.80)',fontSize:'.9rem'}}>
                Your invite link contains your personal RSVP access.
              </p>
            )}
          </div>

          {/* Find My Table CTA */}
          <div className="inv-cta-banner table" data-testid="public-table-finder">
            <p className="inv-section-label">Seating</p>
            <h2 className="inv-section-title">Find Your Table</h2>
            <p className="inv-section-body">After RSVPs close, you can look up your seat assignment here.</p>
            <a href={`/find-table/${slug}`} className="inv-btn-primary">🪑 Find My Table</a>
          </div>

        </div>

        {/* ─── FOOTER ─── */}
        <footer className="inv-footer">
          <p className="inv-footer-brand">{title}</p>
          <p>
            {date && <span>{formatDate(date)}</span>}
            {date && venueName && <span> · </span>}
            {venueName && <span>{venueName}</span>}
          </p>
          <p style={{marginTop:16}}>Created with <Link href="/">WedPlan</Link></p>
        </footer>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org', '@type': 'Event',
              name: title, description,
              startDate: date || undefined,
              location: { '@type': 'Place', name: venueName || undefined },
              image: heroImage,
              organizer: { '@type': 'Person', name: title },
            }),
          }}
        />
      </div>
    </>
  );
}
