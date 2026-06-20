import React from 'react';
import Image from 'next/image';
import { db, getAgendaEventsByWedding, getGalleryImagesByWedding } from '@/lib/store';
import { notFound } from 'next/navigation';
import { getInvitationContent, renderMarkdownBlocks, type InvitationContent } from '@/lib/invitation-content';
import CountdownTimer from './CountdownTimer';
import GalleryImageTile from './GalleryImageTile';
import { formatEventDateTime } from './invitation-date';

type Props = { params: Promise<{ slug: string }> };

type WeddingRecord = {
  id: string; slug: string; weddingTitle?: string; brideName?: string; groomName?: string;
  date?: string; time?: string; timezone?: string; venueName?: string; venueAddress?: string;
  venueMapLink?: string; profileImage?: string | null; rsvpDeadline?: string; story?: string;
  sections?: Record<string, boolean>; invitationContent?: Partial<InvitationContent>;
  theme?: { primaryColor?: string; secondaryColor?: string; accentColor?: string };
};
type GalleryImageRecord = { id: string; imageType?: string; imageUrl?: string; altText?: string; caption?: string; width?: number; height?: number };
type AgendaEventRecord = { id: string; weddingId: string; icon?: string; iconKey?: string; title: string; startTime?: string; endTime?: string; time?: string; duration?: number; timezone?: string; location?: string; description?: string; sortOrder?: number };

const AGENDA_ICON_LABELS: Record<string, string> = {
  CalendarDays: '📅', Calendar: '📅', Clock: '⏰', Clock4: '⏰',
  GlassWater: '🥂', PartyPopper: '🎉', Music: '🎵', MapPin: '📍',
  Utensils: '🍽️', Camera: '📷', Gift: '🎁', Mic2: '🎤', Sparkles: '✨', Ring: '💍',
};

function renderAgendaIcon(item: AgendaEventRecord) {
  const key = String(item.icon || item.iconKey || '').trim();
  return AGENDA_ICON_LABELS[key] ?? '✦';
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; }
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const wedding = db.weddings.findUnique((w: WeddingRecord) => w.slug === slug) as WeddingRecord | null;
  if (!wedding) notFound();
  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;
  const description = `Join ${wedding.brideName} and ${wedding.groomName} on ${formatDate(wedding.date)} at ${wedding.venueName}`;
  return {
    title, description,
    openGraph: { title, description, images: [{ url: `/invitation/${slug}/opengraph-image`, alt: title }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [`/invitation/${slug}/twitter-image`] },
  };
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const weddingOrNull = db.weddings.findUnique((w: WeddingRecord) => w.slug === slug) as WeddingRecord | null;
  if (!weddingOrNull) notFound();
  const wedding = weddingOrNull as WeddingRecord;

  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;
  const description = `Join ${wedding.brideName} and ${wedding.groomName} on ${formatDate(wedding.date)} at ${wedding.venueName}`;
  const content = getInvitationContent(wedding);
  const messageBlocks = renderMarkdownBlocks(content.messageMarkdown);
  const detailsBlocks = renderMarkdownBlocks(content.detailsMarkdown);
  const closingBlocks = renderMarkdownBlocks(content.closingMarkdown);
  const sec = (key: string) => wedding.sections?.[key] !== false;
  const galleryImages = getGalleryImagesByWedding(wedding.id).filter((img: GalleryImageRecord) => (img.imageType || 'gallery') === 'gallery') as GalleryImageRecord[];
  const agenda = getAgendaEventsByWedding(wedding.id) as AgendaEventRecord[];
  const eventLabel = formatEventDateTime(wedding.date, wedding.time, wedding.timezone || 'UTC');

  const primary = wedding.theme?.primaryColor || '#C45A74';
  const gold = wedding.theme?.secondaryColor || '#C9A574';
  const sage = wedding.theme?.accentColor || '#8FA98F';

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
          --inv-subtle: rgba(196,90,116,0.10);
          --inv-border: rgba(196,90,116,0.15);
          --inv-radius: 20px;
          --inv-shadow: 0 8px 32px rgba(100,50,70,0.10);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .inv-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--inv-bg);color:var(--inv-text);min-height:100vh;-webkit-font-smoothing:antialiased}

        /* ── Hero ── */
        .inv-hero{
          position:relative;min-height:100svh;display:flex;flex-direction:column;
          align-items:center;justify-content:flex-end;overflow:hidden;
          padding:0 16px 56px;text-align:center;
        }
        .inv-hero-bg{
          position:absolute;inset:0;
          background:linear-gradient(160deg,#1a0a0e 0%,#3d1a27 40%,#6b2a41 70%,#c45a74 100%);
        }
        .inv-hero-bg::after{
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,165,116,0.18) 0%, transparent 70%);
        }
        .inv-hero-img{position:absolute;inset:0;object-fit:cover;opacity:0.32;mix-blend-mode:luminosity}
        .inv-hero-decoration{
          position:absolute;top:0;left:0;right:0;height:100%;
          background:radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,165,116,0.10) 0%, transparent 70%);
          pointer-events:none;
        }
        .inv-hero-eyebrow{
          position:relative;z-index:1;
          letter-spacing:.35em;text-transform:uppercase;font-size:.72rem;
          color:rgba(255,255,255,0.55);margin-bottom:20px;font-weight:500;
        }
        .inv-hero-names{
          position:relative;z-index:1;
          font-family:Georgia,'Times New Roman',serif;
          font-size:clamp(3rem,12vw,8rem);font-weight:400;line-height:1;
          color:#fff;letter-spacing:-.02em;margin-bottom:24px;
        }
        .inv-hero-names span{
          display:block;font-size:.38em;letter-spacing:.2em;
          text-transform:uppercase;color:var(--inv-gold);
          margin:.5em 0;font-family:inherit;font-weight:300;
        }
        .inv-hero-date{
          position:relative;z-index:1;
          font-size:clamp(.9rem,2.2vw,1.1rem);color:rgba(255,255,255,0.72);
          letter-spacing:.08em;margin-bottom:36px;
        }
        .inv-hero-ctas{position:relative;z-index:1;display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
        .inv-btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 32px;border-radius:999px;
          background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 70%,var(--inv-gold)));
          color:#fff;text-decoration:none;font-size:.95rem;font-weight:600;
          letter-spacing:.02em;border:none;cursor:pointer;
          box-shadow:0 8px 24px rgba(196,90,116,0.40);
          transition:transform .15s,box-shadow .15s;
        }
        .inv-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(196,90,116,0.50)}
        .inv-btn-secondary{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:999px;
          background:rgba(255,255,255,0.14);backdrop-filter:blur(8px);
          color:#fff;text-decoration:none;font-size:.95rem;font-weight:500;
          border:1px solid rgba(255,255,255,0.28);
          transition:background .15s;
        }
        .inv-btn-secondary:hover{background:rgba(255,255,255,0.22)}
        .inv-scroll-hint{
          position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
          z-index:1;display:flex;flex-direction:column;align-items:center;
          gap:6px;color:rgba(255,255,255,0.40);font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;
        }
        .inv-scroll-hint::after{
          content:'';display:block;width:1px;height:32px;
          background:linear-gradient(to bottom,rgba(255,255,255,0.40),transparent);
        }

        /* ── Layout ── */
        .inv-body{max-width:840px;margin:0 auto;padding:0 16px 80px;display:grid;gap:28px}
        @media(min-width:600px){.inv-body{padding:0 32px 80px}}

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
          font-family:Georgia,serif;font-size:clamp(1.8rem,5vw,2.6rem);
          font-weight:400;color:var(--inv-text);line-height:1.15;margin-bottom:12px;
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
        .inv-detail-sub{font-size:.85rem;color:var(--inv-muted);margin-top:2px}

        /* ── Countdown ── */
        .inv-countdown-card{
          text-align:center;
          background:linear-gradient(135deg,rgba(196,90,116,0.08),rgba(201,165,116,0.10));
          border:1px solid rgba(201,165,116,0.25);
        }

        /* ── Story ── */
        .inv-story-card{padding:32px 28px;line-height:1.85}
        .inv-story-card p{color:var(--inv-muted);font-size:1rem;margin-bottom:1em}
        .inv-story-card h3{font-family:Georgia,serif;font-size:1.4rem;font-weight:400;color:var(--inv-text);margin-bottom:.6em}

        /* ── Agenda ── */
        .inv-agenda-track{display:grid;gap:0;position:relative;padding-left:40px}
        .inv-agenda-track::before{
          content:'';position:absolute;left:19px;top:24px;bottom:24px;width:2px;
          background:linear-gradient(to bottom,transparent,var(--inv-gold) 10%,var(--inv-gold) 90%,transparent);
          opacity:.4;
        }
        .inv-agenda-entry{
          display:grid;grid-template-columns:auto 1fr;gap:0 16px;
          padding-bottom:28px;position:relative;
        }
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
        .inv-agenda-loc{font-size:.8rem;color:var(--inv-muted);margin-top:6px;display:flex;align-items:center;gap:4px}

        /* ── Gallery ── */
        .inv-gallery-grid{
          display:grid;gap:12px;
          grid-template-columns:repeat(2,1fr);
        }
        @media(min-width:520px){.inv-gallery-grid{grid-template-columns:repeat(3,1fr)}}
        .inv-gallery-grid > *:first-child{grid-column:1/-1}
        @media(min-width:520px){.inv-gallery-grid > *:first-child{grid-column:auto}}
        .inv-gallery-empty{
          min-height:200px;display:grid;place-items:center;text-align:center;
          padding:40px 24px;border-radius:16px;
          border:2px dashed rgba(196,90,116,0.20);
          background:rgba(196,90,116,0.04);
        }
        .inv-gallery-empty-icon{font-size:2.5rem;margin-bottom:12px;opacity:.4}
        .inv-gallery-empty-text{color:var(--inv-muted);font-size:.92rem;line-height:1.6}

        /* ── CTA banners ── */
        .inv-cta-banner{
          border-radius:var(--inv-radius);padding:36px 28px;text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:20px;
        }
        .inv-cta-banner.rsvp{
          background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 60%,var(--inv-gold)));
          box-shadow:0 12px 40px rgba(196,90,116,0.35);
        }
        .inv-cta-banner.rsvp *{color:#fff}
        .inv-cta-banner.rsvp .inv-btn-primary{
          background:rgba(255,255,255,0.22);
          border:1px solid rgba(255,255,255,0.40);
          box-shadow:none;
        }
        .inv-cta-banner.rsvp .inv-btn-primary:hover{background:rgba(255,255,255,0.32)}
        .inv-cta-banner.table{background:var(--inv-surface);border:1px solid var(--inv-border)}
        .inv-cta-banner .inv-section-title{margin-bottom:8px}
        .inv-cta-banner .inv-section-body{max-width:480px}

        /* ── Map link ── */
        .inv-map-link{
          display:inline-flex;align-items:center;gap:8px;
          padding:11px 20px;border-radius:999px;
          background:rgba(196,90,116,0.08);border:1px solid var(--inv-border);
          color:var(--inv-primary);text-decoration:none;font-size:.88rem;font-weight:600;
          transition:background .15s;
        }
        .inv-map-link:hover{background:rgba(196,90,116,0.14)}

        /* ── Footer ── */
        .inv-footer{
          text-align:center;padding:32px 16px 48px;
          border-top:1px solid var(--inv-border);
          color:var(--inv-muted);font-size:.82rem;line-height:1.7;
        }
        .inv-footer a{color:var(--inv-primary);text-decoration:none}
        .inv-footer-brand{font-family:Georgia,serif;font-size:1.5rem;color:var(--inv-text);margin-bottom:8px;font-weight:400}

        /* ── Reduced motion ── */
        @media(prefers-reduced-motion:reduce){
          *{animation:none!important;transition:none!important}
        }
      `}</style>

      <div className="inv-root">

        {/* ─── HERO ─── */}
        <header className="inv-hero">
          <div className="inv-hero-bg" aria-hidden="true" />
          <div className="inv-hero-decoration" aria-hidden="true" />
          {wedding.profileImage && (
            <Image src={wedding.profileImage} alt={title} fill className="inv-hero-img" priority sizes="100vw" />
          )}
          <p className="inv-hero-eyebrow">You are warmly invited to celebrate</p>
          <h1 className="inv-hero-names">
            {wedding.brideName}
            <span>&amp;</span>
            {wedding.groomName}
          </h1>
          {(wedding.date || wedding.venueName) && (
            <p className="inv-hero-date">
              {formatDate(wedding.date)}{wedding.date && wedding.venueName ? ' · ' : ''}{wedding.venueName}
            </p>
          )}
          <div className="inv-hero-ctas">
            {sec('rsvp') && (
              <a href={`/rsvp/${wedding.slug}`} className="inv-btn-primary">
                ✉ RSVP Now
              </a>
            )}
            {wedding.venueName && (
              <a
                href={wedding.venueMapLink || `https://maps.google.com/?q=${encodeURIComponent(wedding.venueName)}`}
                target="_blank" rel="noreferrer"
                className="inv-btn-secondary"
              >
                📍 View Venue
              </a>
            )}
          </div>
          <div className="inv-scroll-hint" aria-hidden="true">Scroll</div>
        </header>

        {/* ─── BODY ─── */}
        <div className="inv-body">

          {/* Event Details */}
          {sec('details') && (
            <section>
              <p className="inv-section-label">Event Details</p>
              <div className="inv-details-grid">
                {wedding.date && (
                  <div className="inv-detail-pill">
                    <span className="inv-detail-icon">📅</span>
                    <div>
                      <p className="inv-detail-label">Date</p>
                      <p className="inv-detail-value">{formatDate(wedding.date)}</p>
                      {wedding.time && <p className="inv-detail-sub">{formatTime(wedding.time)}</p>}
                    </div>
                  </div>
                )}
                {wedding.venueName && (
                  <div className="inv-detail-pill">
                    <span className="inv-detail-icon">📍</span>
                    <div>
                      <p className="inv-detail-label">Venue</p>
                      <p className="inv-detail-value">{wedding.venueName}</p>
                      {wedding.venueAddress && <p className="inv-detail-sub">{wedding.venueAddress}</p>}
                    </div>
                  </div>
                )}
                {wedding.rsvpDeadline && (
                  <div className="inv-detail-pill">
                    <span className="inv-detail-icon">⏳</span>
                    <div>
                      <p className="inv-detail-label">RSVP By</p>
                      <p className="inv-detail-value">{formatDate(wedding.rsvpDeadline)}</p>
                    </div>
                  </div>
                )}
                {wedding.venueAddress && (
                  <div className="inv-detail-pill">
                    <span className="inv-detail-icon">🗺️</span>
                    <div>
                      <p className="inv-detail-label">Directions</p>
                      <a
                        href={wedding.venueMapLink || `https://maps.google.com/?q=${encodeURIComponent(wedding.venueAddress)}`}
                        target="_blank" rel="noreferrer" className="inv-map-link" style={{marginTop:4}}
                      >
                        Open in Maps →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Countdown */}
          {sec('countdown') && wedding.date && (
            <section className="inv-card inv-countdown-card">
              <p className="inv-section-label" style={{marginBottom:6}}>Counting down to</p>
              <h2 className="inv-section-title" style={{textAlign:'center',marginBottom:20}}>{eventLabel}</h2>
              <CountdownTimer date={wedding.date} time={wedding.time} timezone={wedding.timezone || 'UTC'} />
            </section>
          )}

          {/* Message / Story */}
          {sec('message') && (
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
          )}

          {/* Couple story from profile */}
          {sec('story') && wedding.story && (
            <section className="inv-card inv-story-card">
              <p className="inv-section-label">Our story</p>
              <p>{wedding.story}</p>
            </section>
          )}

          {/* Details / venue content */}
          {sec('venueMap') && detailsBlocks.length > 0 && (
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
          {sec('agenda') && agenda.length > 0 && (
            <section className="inv-card" data-testid="public-agenda">
              <p className="inv-section-label">The day</p>
              <h2 className="inv-section-title">Day&apos;s Schedule</h2>
              <p className="inv-section-body" style={{marginBottom:28}}>
                The celebration timeline — we can&apos;t wait to share these moments with you.
              </p>
              <div className="inv-agenda-track" data-testid="public-agenda-list" role="list">
                {agenda.map((item) => (
                  <article key={item.id} className="inv-agenda-entry" data-testid="public-agenda-item" role="listitem">
                    <div className="inv-agenda-dot" data-testid="public-agenda-icon">{renderAgendaIcon(item)}</div>
                    <div className="inv-agenda-content">
                      <time className="inv-agenda-time" dateTime={item.startTime || item.time || ''} data-testid="public-agenda-time">
                        {formatTime(item.startTime || item.time)}
                        {item.endTime ? ` – ${formatTime(item.endTime)}` : ''}
                      </time>
                      <h3 className="inv-agenda-title" data-testid="public-agenda-title">{item.title}</h3>
                      {item.description && <p className="inv-agenda-desc" data-testid="public-agenda-description">{item.description}</p>}
                      {item.location && (
                        <p className="inv-agenda-loc" data-testid="public-agenda-location">
                          <span>📍</span>{item.location}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {sec('gallery') && (
            <section className="inv-card" data-testid="public-gallery">
              <p className="inv-section-label">Gallery</p>
              <h2 className="inv-section-title">Favourite Moments</h2>
              <p className="inv-section-body" style={{marginBottom:20}}>
                A few memories the couple has shared ahead of the celebration.
              </p>
              {galleryImages.length > 0 ? (
                <div className="inv-gallery-grid" data-testid="public-gallery-grid">
                  {galleryImages.map((img) => (
                    <GalleryImageTile
                      key={img.id}
                      src={img.imageUrl}
                      alt={img.altText || img.caption || 'Wedding photo'}
                      width={Number(img.width || 0)}
                      height={Number(img.height || 0)}
                      caption={img.altText || img.caption || ''}
                    />
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
          )}

          {/* Closing / special message */}
          {sec('specialMessage') && closingBlocks.length > 0 && (
            <section className="inv-card inv-story-card">
              {closingBlocks.map((block, i) => {
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

          {/* RSVP CTA */}
          {sec('rsvp') && (
            <div className="inv-cta-banner rsvp" data-testid="public-rsvp-cta">
              <h2 className="inv-section-title">We&apos;d love to know you&apos;re coming.</h2>
              <p className="inv-section-body">
                Your response helps us prepare seating, meals, and a warm welcome for you and your family.
              </p>
              <a href={`/rsvp/${wedding.slug}`} className="inv-btn-primary">
                ✉ Respond to Invitation
              </a>
            </div>
          )}

          {/* Find My Table CTA */}
          {sec('tableFinder') && (
            <div className="inv-cta-banner table" data-testid="public-table-finder">
              <p className="inv-section-label">Seating</p>
              <h2 className="inv-section-title">Find Your Table</h2>
              <p className="inv-section-body">
                After RSVPs close, you can look up your seat assignment here.
              </p>
              <a href={`/find-table/${wedding.slug}`} className="inv-btn-primary">
                🪑 Find My Table
              </a>
            </div>
          )}

        </div>

        {/* ─── FOOTER ─── */}
        <footer className="inv-footer">
          <p className="inv-footer-brand">{title}</p>
          <p>
            {wedding.date && <span>{formatDate(wedding.date)}</span>}
            {wedding.date && wedding.venueName && <span> · </span>}
            {wedding.venueName && <span>{wedding.venueName}</span>}
          </p>
          <p style={{marginTop:16}}>
            Created with <a href="/">WedPlan</a>
          </p>
        </footer>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org', '@type': 'Event',
              name: title, description: wedding.story || description,
              startDate: wedding.date && wedding.time ? `${wedding.date}T${wedding.time}` : wedding.date,
              location: { '@type': 'Place', name: wedding.venueName, address: wedding.venueAddress || undefined },
              image: wedding.profileImage || undefined,
              organizer: { '@type': 'Person', name: title },
            }),
          }}
        />
      </div>
    </>
  );
}
