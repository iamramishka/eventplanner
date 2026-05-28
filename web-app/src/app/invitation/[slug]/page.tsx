import React from 'react';
import Image from 'next/image';
import { db, getAgendaEventsByWedding, getGalleryImagesByWedding } from '@/lib/store';
import { notFound } from 'next/navigation';
import { getInvitationContent, renderMarkdownBlocks, type InvitationContent } from '@/lib/invitation-content';
import CountdownTimer from './CountdownTimer';
import GalleryImageTile from './GalleryImageTile';
import { formatEventDateTime } from './invitation-date';
import {
  Calendar,
  CalendarDays,
  Camera,
  Clock,
  Clock4,
  Gift,
  GlassWater,
  MapPin,
  Mic2,
  Music,
  PartyPopper,
  Sparkles,
  Utensils,
} from 'lucide-react';

type Props = { params: Promise<{ slug: string }> };
type WeddingRecord = {
  id: string;
  slug: string;
  weddingTitle?: string;
  brideName?: string;
  groomName?: string;
  date?: string;
  time?: string;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  profileImage?: string | null;
  rsvpDeadline?: string;
  story?: string;
  sections?: Record<string, boolean>;
  invitationContent?: Partial<InvitationContent>;
};
type GalleryImageRecord = {
  id: string;
  imageType?: string;
  imageUrl?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
};
type AgendaEventRecord = {
  id: string;
  weddingId: string;
  icon?: string;
  iconKey?: string;
  title: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  duration?: number;
  durationMinutes?: number;
  timezone?: string;
  location?: string;
  description?: string;
  sortOrder?: number;
};

const AGENDA_ICON_MAP: Record<string, React.ElementType> = {
  CalendarDays,
  Calendar,
  Clock,
  Clock4,
  GlassWater,
  PartyPopper,
  Music,
  MapPin,
  Utensils,
  Camera,
  Gift,
  Mic2,
  Sparkles,
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  // `params` may be a Promise in some Next runtime shapes — unwrap it safely
  const resolvedParams = (await params) as { slug: string };
  const slug = resolvedParams.slug;
  // Use findUnique for clarity
  const wedding = db.weddings.findUnique((w: WeddingRecord) => w.slug === slug) as WeddingRecord | null;
  if (!wedding) {
    notFound();
  }

  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;
  const description = `Join ${wedding.brideName} and ${wedding.groomName} on ${wedding.date} at ${wedding.venueName}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/invitation/${slug}/opengraph-image`,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/invitation/${slug}/twitter-image`],
    },
  };
}

export default async function InvitationPage({ params }: Props) {
  const resolvedParams = (await params) as { slug: string };
  const { slug } = resolvedParams;
  const wedding = db.weddings.findUnique((w: WeddingRecord) => w.slug === slug) as WeddingRecord | null;
  if (!wedding) {
    notFound();
  }

  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;
  const description = `Join ${wedding.brideName} and ${wedding.groomName} on ${wedding.date} at ${wedding.venueName}`;
  const content = getInvitationContent(wedding);
  const messageBlocks = renderMarkdownBlocks(content.messageMarkdown);
  const detailsBlocks = renderMarkdownBlocks(content.detailsMarkdown);
  const closingBlocks = renderMarkdownBlocks(content.closingMarkdown);
  const sectionEnabled = (key: string) => wedding.sections?.[key] !== false;
  const galleryImages = getGalleryImagesByWedding(wedding.id)
    .filter((image: GalleryImageRecord) => (image.imageType || 'gallery') === 'gallery') as GalleryImageRecord[];
  const agenda = getAgendaEventsByWedding(wedding.id) as AgendaEventRecord[];
  const eventLabel = formatEventDateTime(wedding.date, wedding.time, wedding.timezone || 'UTC');

  return (
    <main style={{fontFamily:'Georgia,serif',background:'linear-gradient(180deg, #fffaf7 0%, #f8ebe4 100%)',minHeight:'100vh'}}>
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px clamp(16px, 4vw, 40px) 40px',
          display: 'grid',
          gap: 24,
        }}
      >
        {sectionEnabled('hero') ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                borderRadius: 28,
                padding: 28,
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid rgba(153, 90, 109, 0.15)',
                boxShadow: '0 20px 60px rgba(122, 71, 88, 0.10)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 76,
                  position: 'relative',
                  borderRadius: 12,
                  background: '#fff',
                  border: '2px solid #d6a6b3',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, transparent 49%, #d6a6b3 50%, transparent 51%), linear-gradient(225deg, transparent 49%, #d6a6b3 50%, transparent 51%)',
                  }}
                />
              </div>
              <div>
                <div style={{ letterSpacing: 4, textTransform: 'uppercase', color: '#9a5a6d', fontSize: 12 }}>You are invited</div>
                <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2.3rem, 6vw, 4.9rem)', lineHeight: 1.02, color: '#4b2230' }}>{title}</h1>
                <p style={{ margin: '16px 0 0', color: '#6b4a56', fontSize: 'clamp(1rem, 2.8vw, 1.2rem)', lineHeight: 1.6 }}>
                  {content.intro}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a href={`/rsvp/${wedding.slug}`} style={bannerButtonStyle}>Open RSVP</a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(wedding.venueName || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.82)',
                    color: '#6d2f42',
                    textDecoration: 'none',
                    border: '1px solid rgba(109, 47, 66, 0.15)',
                  }}
                >
                  View Map
                </a>
              </div>
            </div>

            <div
              style={{
                borderRadius: 28,
                padding: 18,
                background: 'linear-gradient(135deg, rgba(196,90,116,0.12), rgba(201,165,116,0.12))',
                border: '1px solid rgba(153, 90, 109, 0.12)',
                minHeight: 340,
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 340, borderRadius: 22, overflow: 'hidden', background: '#f7ece7' }}>
                {wedding.profileImage ? (
                  <Image
                    src={wedding.profileImage}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: '#8f6873', textAlign: 'center', padding: 24 }}>
                    <div>
                      <div style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase' }}>Invitation cover</div>
                      <div style={{ marginTop: 12, fontSize: 22 }}>The full hero image will appear here.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <section style={{ borderRadius: 28, padding: 28, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(153, 90, 109, 0.15)' }}>
            <div style={{ letterSpacing: 4, textTransform: 'uppercase', color: '#9a5a6d', fontSize: 12 }}>You are invited</div>
            <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2.2rem, 6vw, 4.4rem)', lineHeight: 1.02, color: '#4b2230' }}>{title}</h1>
            <p style={{ margin: '16px 0 0', color: '#6b4a56', lineHeight: 1.6 }}>{content.intro}</p>
          </section>
        )}

        {sectionEnabled('details') && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <article style={cardStyle}>
              <div style={eyebrowStyle}>Wedding details</div>
              <div style={infoLineStyle}>{wedding.date} • {wedding.time}</div>
              <div style={infoLineStyle}>{wedding.venueName}</div>
              <div style={mutedStyle}>{wedding.venueAddress}</div>
            </article>
            {sectionEnabled('countdown') && (
              <article style={cardStyle}>
                <div style={eyebrowStyle}>Countdown</div>
                <CountdownTimer date={wedding.date} time={wedding.time} timezone={wedding.timezone || 'UTC'} />
              </article>
            )}
            <article style={cardStyle}>
              <div style={eyebrowStyle}>Quick note</div>
              <div style={mutedStyle}>Please arrive a little early so you can settle in before the ceremony begins.</div>
            </article>
          </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {sectionEnabled('message') && (
            <article style={contentCardStyle}>
              {messageBlocks.map((block, index) => renderBlock(block, index))}
            </article>
          )}
          {sectionEnabled('venueMap') && (
            <article style={contentCardStyle}>
              {detailsBlocks.map((block, index) => renderBlock(block, index))}
            </article>
          )}
          {sectionEnabled('specialMessage') && (
            <article style={contentCardStyle}>
              {closingBlocks.map((block, index) => renderBlock(block, index))}
            </article>
          )}
        </section>

        {sectionEnabled('agenda') && agenda.length > 0 && (
          <section data-testid="public-agenda" className="public-agenda-panel">
            <style>{agendaCss}</style>
            <div>
              <div style={eyebrowStyle}>The day</div>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#4b2230' }}>Day&apos;s Schedule</h2>
              <p style={{ margin: '10px 0 0', color: '#6b4a56', lineHeight: 1.7, maxWidth: 680 }}>
                The celebration timeline, shared from the couple&apos;s planning dashboard.
              </p>
            </div>

            <div className="public-agenda-timeline" data-testid="public-agenda-list" role="list">
              {agenda.map((item) => {
                const timeLabel = formatAgendaTimeRange(item);
                const durationLabel = formatAgendaDuration(item);
                const iconValue = String(item.icon || item.iconKey || '').trim();
                return (
                  <article
                    key={item.id}
                    className="public-agenda-item"
                    data-testid="public-agenda-item"
                    data-agenda-id={item.id}
                    role="listitem"
                  >
                    <time className="public-agenda-time" data-testid="public-agenda-time" dateTime={item.startTime || item.time || ''}>
                      {timeLabel}
                    </time>
                    <div
                      className="public-agenda-dot"
                      data-testid="public-agenda-icon"
                      data-icon-key={iconValue}
                      data-icon-mode={getAgendaIconMode(item)}
                    >
                      {renderAgendaIcon(item)}
                    </div>
                    <div className="public-agenda-card">
                      <h3 className="public-agenda-title clamp-one" data-testid="public-agenda-title" title={item.title}>{item.title}</h3>
                      {item.description && (
                        <p className="public-agenda-desc clamp-two" data-testid="public-agenda-description" title={item.description}>
                          {item.description}
                        </p>
                      )}
                      {(durationLabel || item.location) && (
                        <div className="public-agenda-meta">
                          {durationLabel && <span data-testid="public-agenda-duration"><Clock4 size={14} /> {durationLabel}</span>}
                          {item.location && <span data-testid="public-agenda-location" title={item.location}><MapPin size={14} /> {item.location}</span>}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {sectionEnabled('gallery') && (
          <section
            data-testid="public-gallery"
            style={{
              ...sectionPanelStyle,
              display: 'grid',
              gap: 22,
            }}
          >
            <div>
              <div style={eyebrowStyle}>Gallery</div>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#4b2230' }}>Favorite moments</h2>
              <p style={{ margin: '10px 0 0', color: '#6b4a56', lineHeight: 1.7, maxWidth: 680 }}>
                A few memories from the couple, shared for family and friends ahead of {eventLabel}.
              </p>
            </div>

            {galleryImages.length > 0 ? (
              <div
                data-testid="public-gallery-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 18,
                  alignItems: 'start',
                }}
              >
                {galleryImages.map((image) => (
                  <GalleryImageTile
                    key={image.id}
                    src={image.imageUrl}
                    alt={image.altText || image.caption || 'Wedding gallery image'}
                    width={Number(image.width || 0)}
                    height={Number(image.height || 0)}
                    caption={image.altText || image.caption || ''}
                  />
                ))}
              </div>
            ) : (
              <div data-testid="public-gallery-empty" style={galleryEmptyStyle}>
                <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#9a5a6d' }}>Photos coming soon</div>
                <p style={{ margin: '10px auto 0', color: '#6b4a56', lineHeight: 1.7, maxWidth: 520 }}>
                  The couple has not added gallery photos yet. Please check back closer to the celebration.
                </p>
              </div>
            )}
          </section>
        )}

        {sectionEnabled('tableFinder') && (
          <section data-testid="public-table-finder" style={tableFinderBannerStyle}>
            <div>
              <div style={eyebrowStyle}>Seating</div>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#4b2230' }}>Find your table.</h2>
              <p style={{ margin: '10px 0 0', color: '#6b4a56', lineHeight: 1.7, maxWidth: 620 }}>
                Verify your invitation to see your table assignment.
              </p>
            </div>
            <a href={`/find-table/${wedding.slug}`} style={bannerButtonStyle}>Find My Table</a>
          </section>
        )}

        {sectionEnabled('rsvp') && (
          <section style={rsvpBannerStyle}>
            <div>
              <div style={eyebrowStyle}>RSVP</div>
              <h2 style={{ margin: '8px 0 0', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#4b2230' }}>We’d love to know you’re coming.</h2>
              <p style={{ margin: '10px 0 0', color: '#6b4a56', lineHeight: 1.7, maxWidth: 640 }}>
                Your response helps us prepare the right seating, meals, and welcome details for the celebration.
              </p>
            </div>
            <a href={`/rsvp/${wedding.slug}`} style={bannerButtonStyle}>Respond now</a>
          </section>
        )}

        {/* JSON-LD for enhanced SEO and rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: title,
              startDate: wedding.date && wedding.time ? `${wedding.date}T${wedding.time}` : wedding.date,
              location: {
                '@type': 'Place',
                name: wedding.venueName,
                address: wedding.venueAddress || undefined,
              },
              image: wedding.profileImage || undefined,
              description: wedding.story || description,
              organizer: {
                '@type': 'Organization',
                name: `${wedding.brideName} & ${wedding.groomName}`,
              },
            }),
          }}
        />
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 20,
  background: 'rgba(255,255,255,0.76)',
  border: '1px solid rgba(153, 90, 109, 0.12)',
  boxShadow: '0 14px 40px rgba(122, 71, 88, 0.08)',
};

const contentCardStyle: React.CSSProperties = {
  ...cardStyle,
  padding: 24,
  lineHeight: 1.7,
  color: '#5a3947',
};

const sectionPanelStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: '24px clamp(20px, 4vw, 32px)',
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(153, 90, 109, 0.12)',
  boxShadow: '0 14px 40px rgba(122, 71, 88, 0.07)',
};

const agendaCss = `
.public-agenda-panel {
  border-radius: 28px;
  padding: 24px clamp(20px, 4vw, 32px);
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(153, 90, 109, 0.12);
  box-shadow: 0 14px 40px rgba(122, 71, 88, 0.07);
  display: grid;
  gap: 28px;
}
.public-agenda-timeline {
  position: relative;
  display: grid;
  gap: 26px;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}
.public-agenda-timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 8px;
  bottom: 8px;
  width: 1.5px;
  background: linear-gradient(to bottom, transparent, #c9a574 12%, #c9a574 88%, transparent);
  transform: translateX(-50%);
  opacity: 0.58;
}
.public-agenda-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  min-width: 0;
}
.public-agenda-item:nth-child(odd) .public-agenda-time {
  justify-self: end;
  text-align: right;
}
.public-agenda-item:nth-child(odd) .public-agenda-card {
  text-align: left;
  order: 3;
}
.public-agenda-item:nth-child(even) .public-agenda-time {
  justify-self: start;
  text-align: left;
  order: 3;
}
.public-agenda-item:nth-child(even) .public-agenda-card {
  text-align: right;
  order: 1;
}
.public-agenda-item:nth-child(even) .public-agenda-dot {
  order: 2;
}
.public-agenda-time {
  display: inline-flex;
  max-width: 100%;
  color: #9a5a6d;
  font-size: clamp(1rem, 1.8vw, 1.18rem);
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.public-agenda-dot {
  z-index: 1;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #c9a574;
  box-shadow: 0 10px 24px rgba(201, 165, 116, 0.20);
  color: #9a5a6d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.28rem;
}
.public-agenda-card {
  min-width: 0;
  padding: 16px 18px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(153, 90, 109, 0.12);
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(122, 71, 88, 0.08);
}
.public-agenda-title {
  margin: 0;
  color: #4b2230;
  font-size: 1.12rem;
  line-height: 1.25;
}
.public-agenda-desc {
  margin: 6px 0 0;
  color: #6b4a56;
  line-height: 1.6;
  font-size: 0.92rem;
}
.public-agenda-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 12px;
  color: #6b4a56;
  font-size: 0.82rem;
}
.public-agenda-item:nth-child(even) .public-agenda-meta {
  justify-content: flex-end;
}
.public-agenda-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  max-width: 100%;
}
.clamp-one,
.clamp-two {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.clamp-one { -webkit-line-clamp: 1; line-clamp: 1; }
.clamp-two { -webkit-line-clamp: 2; line-clamp: 2; }
@media (max-width: 760px) {
  .public-agenda-timeline::before {
    left: 28px;
  }
  .public-agenda-item {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
  }
  .public-agenda-item .public-agenda-time {
    grid-column: 2;
    grid-row: 1;
    justify-self: start;
    text-align: left;
    order: 1;
  }
  .public-agenda-item .public-agenda-dot {
    grid-column: 1;
    grid-row: 1 / 3;
    order: 0;
  }
  .public-agenda-item .public-agenda-card {
    grid-column: 2;
    grid-row: 2;
    text-align: left;
    order: 2;
  }
  .public-agenda-item:nth-child(even) .public-agenda-time {
    justify-self: start;
    text-align: left;
    order: 1;
  }
  .public-agenda-item:nth-child(even) .public-agenda-card {
    text-align: left;
    order: 2;
  }
  .public-agenda-item:nth-child(even) .public-agenda-dot {
    order: 0;
  }
  .public-agenda-item:nth-child(even) .public-agenda-meta {
    justify-content: flex-start;
  }
}`;

const galleryEmptyStyle: React.CSSProperties = {
  minHeight: 220,
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  padding: 24,
  borderRadius: 18,
  background: 'linear-gradient(135deg, rgba(196,90,116,0.08), rgba(201,165,116,0.12))',
  border: '1px dashed rgba(153, 90, 109, 0.22)',
};

const eyebrowStyle: React.CSSProperties = {
  letterSpacing: 4,
  textTransform: 'uppercase',
  color: '#9a5a6d',
  fontSize: 12,
};

const infoLineStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 18,
  color: '#4b2230',
};

const mutedStyle: React.CSSProperties = {
  marginTop: 12,
  color: '#6b4a56',
};

const rsvpBannerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 18,
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px clamp(20px, 4vw, 32px)',
  borderRadius: 28,
  background: 'linear-gradient(135deg, rgba(196,90,116,0.14), rgba(201,165,116,0.14))',
  border: '1px solid rgba(153, 90, 109, 0.14)',
};

const tableFinderBannerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 18,
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '24px clamp(20px, 4vw, 32px)',
  borderRadius: 28,
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(153, 90, 109, 0.12)',
  boxShadow: '0 14px 40px rgba(122, 71, 88, 0.07)',
};

const bannerButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '13px 20px',
  borderRadius: 999,
  background: '#4b2230',
  color: '#fff',
  textDecoration: 'none',
  boxShadow: '0 14px 30px rgba(75, 34, 48, 0.2)',
};

function formatAgendaClock(timeStr?: string) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function formatAgendaTimeRange(item: AgendaEventRecord) {
  const start = item.startTime || item.time || '';
  const end = item.endTime || '';
  if (start && end && start !== end) return `${formatAgendaClock(start)} - ${formatAgendaClock(end)}`;
  return formatAgendaClock(start);
}

function formatAgendaDuration(item: AgendaEventRecord) {
  const duration = Number(item.duration || item.durationMinutes || 0);
  if (!duration) return '';
  if (duration < 60) return `${duration} min`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function isEmojiIcon(value: string) {
  return /[^\u0000-\u007F]/.test(value);
}

function getAgendaIconMode(item: AgendaEventRecord) {
  const iconValue = String(item.icon || item.iconKey || '').trim();
  if (iconValue && isEmojiIcon(iconValue)) return 'emoji';
  return AGENDA_ICON_MAP[iconValue] ? 'mapped' : 'fallback';
}

function renderAgendaIcon(item: AgendaEventRecord) {
  const iconValue = String(item.icon || item.iconKey || '').trim();
  if (iconValue && isEmojiIcon(iconValue)) {
    return <span aria-hidden="true">{iconValue}</span>;
  }
  const Icon = AGENDA_ICON_MAP[iconValue] || CalendarDays;
  return <Icon size={22} strokeWidth={1.8} aria-hidden="true" />;
}

function renderBlock(block: { type: 'heading' | 'paragraph' | 'list'; text?: string; items?: string[] }, index: number) {
  if (block.type === 'heading') {
    return (
      <h3 key={`${block.type}-${index}`} style={{ margin: index === 0 ? 0 : '0 0 12px', color: '#4b2230', fontSize: 22 }}>
        {block.text}
      </h3>
    );
  }

  if (block.type === 'list') {
    return (
      <ul key={`${block.type}-${index}`} style={{ margin: '12px 0 0', paddingLeft: 18 }}>
        {block.items?.map((item, itemIndex) => (
          <li key={itemIndex} style={{ marginTop: itemIndex === 0 ? 0 : 8 }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={`${block.type}-${index}`} style={{ margin: index === 0 ? 0 : '12px 0 0' }}>
      {block.text}
    </p>
  );
}
