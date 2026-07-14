import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { dbSelect } from '@/lib/supabase-db';
import { notFound } from 'next/navigation';
import { getInvitationContent, renderMarkdownBlocks } from '@/lib/invitation-content';
import CountdownTimer from './CountdownTimer';
import FindTableInline from './FindTableInline';
import FloatingMusicPlayer from './FloatingMusicPlayer';
import { AgendaIcon } from '@/components/agenda-icons';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const DEFAULT_HERO = '/images/default-hero.jpg';
const DEFAULT_COUPLE_PHOTO = '/images/default-couple.jpg';

const DEFAULT_GALLERY_IMAGES = [
  { id: 'dg-1',  imageUrl: '/images/gallery-1.jpg' },
  { id: 'dg-2',  imageUrl: '/images/gallery-2.jpg' },
  { id: 'dg-3',  imageUrl: '/images/gallery-3.jpg' },
  { id: 'dg-4',  imageUrl: '/images/gallery-4.jpg' },
  { id: 'dg-5',  imageUrl: '/images/gallery-5.jpg' },
  { id: 'dg-6',  imageUrl: '/images/gallery-6.jpg' },
  { id: 'dg-7',  imageUrl: '/images/gallery-7.jpg' },
  { id: 'dg-8',  imageUrl: '/images/gallery-8.jpg' },
  { id: 'dg-9',  imageUrl: '/images/gallery-9.jpg' },
  { id: 'dg-10', imageUrl: '/images/gallery-10.jpg' },
  { id: 'dg-11', imageUrl: '/images/gallery-11.jpg' },
  { id: 'dg-12', imageUrl: '/images/gallery-12.jpg' },
  { id: 'dg-13', imageUrl: '/images/gallery-13.jpg' },
];

interface WeddingRow {
  id: string;
  slug: string;
  groomFirstName: string;
  brideFirstName: string;
  eventDate: string | null;
  eventTime: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venueMapLink: string | null;
  rsvpDeadline: string | null;
  specialNoteText: string | null;
  contactEmail: string | null;
  contactWhatsApp: string | null;
}
interface GalleryRow { id: string; imageType: string; imageUrl: string; sortOrder: number }
interface AgendaRow { id: string; title: string; eventTime: string | null; durationMinutes: number | null; description: string | null; iconKey: string | null; sortOrder: number }
interface SiteSettingsRow { id: string; weddingId: string; musicSettings: string | null }

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

function dateOnly(ts?: string | null): string {
  if (!ts) return '';
  return ts.slice(0, 10);
}

function formatDate(d?: string) {
  if (!d) return '';
  try { return new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; }
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}

function formatElegantDate(d?: string): string {
  if (!d) return '';
  const dt = new Date(`${d}T00:00:00`);
  if (isNaN(dt.getTime())) return d;
  const day = dt.getDate();
  const month = dt.toLocaleDateString('en-US', { month: 'long' });
  const year = dt.getFullYear();
  return `${day}${ordinal(day)} ${month} ${year}`;
}

function getDayName(d?: string): string {
  if (!d) return '';
  const dt = new Date(`${d}T00:00:00`);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
}

function formatTimeOnwards(t?: string): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}.${String(m).padStart(2, '0')} ${ampm} Onwards`;
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
  const eventTime = wedding.eventTime || '';
  const venueName = wedding.venueName || '';
  const venueAddress = wedding.venueAddress || '';
  const venueMapLink = wedding.venueMapLink || '';
  const rsvpDeadline = wedding.rsvpDeadline ? wedding.rsvpDeadline.slice(0, 10) : '';
  const specialNoteText = wedding.specialNoteText || '';
  const contactWhatsApp = wedding.contactWhatsApp || '';
  const contactEmail = wedding.contactEmail || '';
  const footerContacts = [contactWhatsApp, contactEmail].filter(Boolean);
  const title = `${brideName} & ${groomName}`;
  const description = `Join ${brideName} and ${groomName} on ${formatDate(date)} at ${venueName || 'our celebration'}`;
  // Show only the Wedding Details card on the invitation page. Flip to false to restore all sections.
  const ONLY_DETAILS: boolean = false;

  const [allImages, siteSettingsRows] = await Promise.all([
    dbSelect<GalleryRow>('GalleryImage', { weddingId: `eq.${wedding.id}`, order: 'sortOrder.asc' }, '*', 500),
    dbSelect<SiteSettingsRow>('SiteSettings', { weddingId: `eq.${wedding.id}` }, 'id,weddingId,musicSettings', 1),
  ]);
  const heroRow = allImages.find((img) => img.imageType === 'hero');
  const couplePhotoRow = allImages.find((img) => img.imageType === 'couple');
  const galleryImages = allImages.filter((img) => (img.imageType || 'gallery') === 'gallery');
  const displayGalleryImages = galleryImages.length > 0 ? galleryImages : DEFAULT_GALLERY_IMAGES;
  const heroImage = heroRow?.imageUrl || DEFAULT_HERO;

  const agenda = await dbSelect<AgendaRow>(
    'AgendaItem',
    { weddingId: `eq.${wedding.id}`, order: 'sortOrder.asc' },
    '*',
    200,
  );

  const content = getInvitationContent({ date, venueName });
  const messageBlocks = renderMarkdownBlocks(content.messageMarkdown);

  const rawMusicSettings = siteSettingsRows[0]?.musicSettings;
  let musicEnabled = false;
  let musicSrc = '/audio/default.mp3';
  if (rawMusicSettings) {
    try {
      const ms = JSON.parse(rawMusicSettings) as { enabled?: boolean; sourceUrl?: string };
      musicEnabled = ms.enabled !== false;
      if (ms.sourceUrl) musicSrc = ms.sourceUrl;
    } catch { /* ignore */ }
  }

  const primary = '#C45A74';
  const gold = '#C9A574';
  const sage = '#8FA98F';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --inv-primary: ${primary};
          --inv-gold: ${gold};
          --inv-sage: ${sage};
          --inv-bg: #FCF8F6;
          --inv-surface: rgba(255,255,255,0.85);
          --inv-text: #2A1A1F;
          --inv-muted: #6b4a56;
          --inv-border: rgba(196,90,116,0.15);
          --inv-radius: 20px;
          --inv-shadow: 0 8px 32px rgba(100,50,70,0.10);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .inv-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--inv-bg);color:var(--inv-text);min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden}

        /* ── Hero ── */
        .inv-hero{
          position:relative;min-height:100svh;display:flex;flex-direction:column;
          align-items:center;justify-content:center;overflow:hidden;
          padding:0 20px 80px;text-align:center;
        }
        .inv-hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
        .inv-hero-overlay{
          position:absolute;inset:0;z-index:1;pointer-events:none;
          background:linear-gradient(to bottom,rgba(20,8,12,0.32) 0%,rgba(20,8,12,0.05) 32%,rgba(20,8,12,0.15) 60%,rgba(20,8,12,0.62) 100%);
        }
        .inv-hero > *{position:relative;z-index:2}
        .inv-hero-eyebrow{letter-spacing:.32em;text-transform:uppercase;font-size:.74rem;color:rgba(255,255,255,0.88);margin-bottom:18px;font-weight:500;text-shadow:0 1px 12px rgba(0,0,0,0.45)}
        .inv-hero-names{font-family:'Playfair Display',Georgia,serif;font-size:clamp(3.2rem,13vw,8.5rem);font-weight:500;line-height:.98;color:#fff;letter-spacing:-.01em;margin-bottom:18px;font-style:italic;text-shadow:0 2px 28px rgba(0,0,0,0.45)}
        .inv-hero-names .amp{display:inline-block;font-size:.7em;font-style:italic;color:var(--inv-gold);margin:0 .12em}
        .inv-hero-sub{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:clamp(1.1rem,3vw,1.6rem);color:rgba(255,255,255,0.92);margin-bottom:30px;text-shadow:0 1px 14px rgba(0,0,0,0.45)}
        .inv-hero-meta{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:34px}
        .inv-hero-meta-label{letter-spacing:.3em;text-transform:uppercase;font-size:.68rem;color:rgba(255,255,255,0.72);font-weight:500}
        .inv-hero-date{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,4vw,2rem);color:#fff;font-weight:500;letter-spacing:.02em;text-shadow:0 2px 18px rgba(0,0,0,0.5)}
        .inv-hero-rule{width:60px;height:1px;background:rgba(255,255,255,0.5);margin:6px 0}
        .inv-hero-venue{font-size:clamp(.92rem,2.2vw,1.1rem);color:rgba(255,255,255,0.86);letter-spacing:.04em;text-shadow:0 1px 12px rgba(0,0,0,0.45)}
        .inv-hero-ctas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
        .inv-scroll-hint{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,0.72);font-size:.68rem;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 1px 10px rgba(0,0,0,0.4)}
        .inv-scroll-hint::after{content:'';display:block;width:1px;height:34px;background:linear-gradient(to bottom,rgba(255,255,255,0.7),transparent)}

        /* ── Buttons ── */
        .inv-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 34px;border-radius:999px;background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 70%,var(--inv-gold)));color:#fff;text-decoration:none;font-size:.95rem;font-weight:600;letter-spacing:.02em;border:none;cursor:pointer;box-shadow:0 8px 28px rgba(196,90,116,0.45);transition:transform .15s,box-shadow .15s}
        .inv-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 34px rgba(196,90,116,0.55)}
        .inv-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:14px 30px;border-radius:999px;background:rgba(255,255,255,0.16);backdrop-filter:blur(10px);color:#fff;text-decoration:none;font-size:.95rem;font-weight:500;border:1px solid rgba(255,255,255,0.5);transition:background .15s}
        .inv-btn-secondary:hover{background:rgba(255,255,255,0.28)}
        .inv-btn-location{display:inline-flex;align-items:center;gap:8px;margin-top:30px;padding:13px 40px;border-radius:999px;border:1px solid var(--inv-gold);background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 78%,#6e3343));color:#fff;font-size:.82rem;font-weight:700;letter-spacing:.18em;text-decoration:none;text-transform:uppercase;box-shadow:0 8px 22px rgba(196,90,116,0.30);transition:all .15s}
        .inv-btn-location:hover{filter:brightness(1.06);transform:translateY(-1px)}

        /* ── Layout ── */
        .inv-body{max-width:840px;margin:0 auto;padding:64px 16px 80px;display:grid;gap:24px}
        @media(min-width:600px){.inv-body{padding:72px 32px 80px}}

        /* ── Cards ── */
        .inv-card{background:var(--inv-surface);backdrop-filter:blur(8px);border:1px solid var(--inv-border);border-radius:var(--inv-radius);box-shadow:var(--inv-shadow);padding:28px 24px}
        .inv-section-label{letter-spacing:.3em;text-transform:uppercase;font-size:.68rem;color:var(--inv-primary);font-weight:600;margin-bottom:14px}
        .inv-section-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,5vw,2.6rem);font-weight:500;color:var(--inv-text);line-height:1.15;margin-bottom:12px}
        .inv-section-body{color:var(--inv-muted);line-height:1.75;font-size:.97rem}

        /* ── Elegant Wedding Details Card ── */
        .inv-details-elegant{text-align:center;padding:40px 28px 32px}
        .inv-ede-eyebrow{letter-spacing:.35em;text-transform:uppercase;font-size:.68rem;color:var(--inv-primary);font-weight:700;margin-bottom:10px}
        .inv-ede-heading{font-family:'Dancing Script',cursive,'Playfair Display',Georgia,serif;font-size:clamp(2.4rem,8vw,3.6rem);color:var(--inv-text);font-weight:600;margin-bottom:24px;line-height:1.1}
        .inv-ede-sep{display:flex;align-items:center;justify-content:center;gap:12px;margin:22px auto;max-width:230px;color:var(--inv-gold)}
        .inv-ede-sep::before,.inv-ede-sep::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--inv-gold))}
        .inv-ede-sep::after{background:linear-gradient(270deg,transparent,var(--inv-gold))}
        .inv-ede-sep span{font-size:.85rem;opacity:.85}
        .inv-ede-item{text-align:center;margin:0 auto}
        .inv-ede-iconrow{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 auto 14px}
        .inv-ede-iconrow::before,.inv-ede-iconrow::after{content:'';width:24px;height:1px;background:var(--inv-gold);opacity:.55}
        .inv-ede-icon{width:56px;height:56px;border-radius:50%;border:1.5px solid var(--inv-gold);background:#fff;display:flex;align-items:center;justify-content:center;color:var(--inv-primary);flex-shrink:0;box-shadow:0 4px 16px rgba(201,165,116,0.18)}
        .inv-ede-item-label{letter-spacing:.32em;text-transform:uppercase;font-size:.72rem;color:var(--inv-muted);font-weight:600;margin-bottom:8px}
        .inv-ede-item-value{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.4rem,5vw,2rem);color:var(--inv-text);font-weight:600;line-height:1.2}
        .inv-ede-accent{color:var(--inv-primary)}
        .inv-ede-item-addr{font-size:.9rem;color:var(--inv-muted);line-height:1.55;margin-top:6px}
        .inv-ede-rsvp-by{margin-top:16px;font-size:.82rem;color:var(--inv-muted);letter-spacing:.05em}
        .inv-ede-rsvp-by strong{color:var(--inv-primary)}

        /* ── With Love Card ── */
        .inv-love-card{text-align:center;padding:38px 32px}
        .inv-love-tag{display:inline-block;letter-spacing:.28em;text-transform:uppercase;font-size:.68rem;color:#fff;background:var(--inv-primary);padding:5px 18px;border-radius:999px;margin-bottom:22px;font-weight:700}
        .inv-love-text{font-family:'Playfair Display',Georgia,serif;font-style:italic;color:var(--inv-muted);line-height:1.9;font-size:1.02rem}
        .inv-love-names{display:block;color:var(--inv-text);font-weight:600;font-style:normal;font-size:1.15rem;margin:6px 0}

        /* ── Countdown ── */
        .inv-countdown-card{text-align:center;background:linear-gradient(135deg,rgba(196,90,116,0.07),rgba(201,165,116,0.10));border:1px solid rgba(201,165,116,0.25)}

        /* ── Story ── */
        .inv-story-card{padding:32px 28px;line-height:1.85}
        .inv-story-card p{color:var(--inv-muted);font-size:1rem;margin-bottom:1em}
        .inv-story-card h3{font-family:'Playfair Display',Georgia,serif;font-size:1.4rem;font-weight:500;color:var(--inv-text);margin-bottom:.6em}

        /* ── Agenda ── */
        .inv-agenda-track{position:relative;display:flex;flex-direction:column;padding:8px 0}
        .inv-agenda-track::before{content:'';position:absolute;left:50%;top:0;bottom:0;width:1.5px;transform:translateX(-50%);background:linear-gradient(to bottom,transparent,var(--inv-gold) 6%,var(--inv-gold) 94%,transparent);opacity:.38}
        .inv-agenda-entry{display:grid;grid-template-columns:1fr 56px 1fr;align-items:center;gap:0 16px;padding-bottom:36px;position:relative}
        .inv-agenda-entry:last-child{padding-bottom:0}
        .inv-agenda-dot{width:48px;height:48px;border-radius:50%;background:#fff;border:2px solid var(--inv-gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 18px rgba(201,165,116,0.28);position:relative;z-index:1;justify-self:center}
        .inv-agenda-col-l{text-align:right;min-width:0}
        .inv-agenda-col-r{text-align:left;min-width:0}
        .inv-agenda-time{display:block;font-size:.76rem;color:var(--inv-primary);font-weight:700;letter-spacing:.08em;text-transform:uppercase;line-height:1.5}
        .inv-agenda-title{font-size:1rem;font-weight:600;color:var(--inv-text);margin-bottom:3px;line-height:1.3}
        .inv-agenda-desc{font-size:.84rem;color:var(--inv-muted);line-height:1.6;margin-top:2px}
        @media(max-width:480px){
          .inv-agenda-entry{grid-template-columns:1fr 44px 1fr;gap:0 10px}
          .inv-agenda-title{font-size:.9rem}
          .inv-agenda-time{font-size:.7rem}
        }

        /* ── Masonry Gallery ── */
        .inv-masonry-card{padding:0;overflow:hidden;width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);border-radius:0;border-left:0;border-right:0}
        .inv-masonry-header{text-align:center;padding:36px 24px 24px}
        .inv-masonry-script{font-family:'Dancing Script',cursive,'Playfair Display',Georgia,serif;font-size:clamp(2rem,6vw,3rem);color:var(--inv-text);font-weight:600;margin-bottom:8px;line-height:1.1}
        .inv-masonry-sub{color:var(--inv-muted);font-size:.9rem;font-style:italic}
        .inv-masonry-grid{columns:2;column-gap:10px;padding:0 16px 28px}
        @media(min-width:520px){.inv-masonry-grid{columns:3;column-gap:12px}}
        @media(min-width:1000px){.inv-masonry-grid{columns:4;column-gap:14px;padding:0 28px 32px}}
        .inv-masonry-item{break-inside:avoid;margin-bottom:8px;border-radius:10px;overflow:hidden}
        .inv-masonry-item img{width:100%;height:auto;display:block;border-radius:10px;transition:transform .3s}
        .inv-masonry-item:hover img{transform:scale(1.03)}
        .inv-gallery-empty{min-height:180px;display:grid;place-items:center;text-align:center;padding:40px 24px;margin:0 16px 24px;border-radius:16px;border:2px dashed rgba(196,90,116,0.20);background:rgba(196,90,116,0.04)}
        .inv-gallery-empty-icon{font-size:2.5rem;margin-bottom:12px;opacity:.4}
        .inv-gallery-empty-text{color:var(--inv-muted);font-size:.92rem;line-height:1.6}

        /* ── Special Note ── */
        .inv-sn-wrap{display:grid;grid-template-columns:1fr 1fr;gap:16px;border:none;padding:0;background:transparent;box-shadow:none}
        @media(max-width:600px){.inv-sn-wrap{grid-template-columns:1fr}}
        .inv-sn-photo{border-radius:18px;overflow:hidden;min-height:280px}
        .inv-sn-photo img{width:100%;height:100%;object-fit:cover;display:block;min-height:280px}
        .inv-sn-card{background:#fff;border:1px solid var(--inv-border);border-radius:18px;padding:36px 32px;display:flex;flex-direction:column;justify-content:center;box-shadow:var(--inv-shadow)}
        .inv-sn-eyebrow{letter-spacing:.3em;text-transform:uppercase;font-size:.68rem;color:var(--inv-muted);font-weight:700;margin-bottom:12px}
        .inv-sn-heading{font-family:'Dancing Script',cursive,'Playfair Display',Georgia,serif;font-size:clamp(1.8rem,5vw,2.4rem);color:var(--inv-text);font-weight:600;margin-bottom:16px;line-height:1.15}
        .inv-sn-text{color:var(--inv-muted);line-height:1.85;font-size:.97rem;margin-bottom:22px;white-space:pre-line}
        .inv-sn-sign{color:var(--inv-muted);font-size:.88rem;margin-bottom:2px}
        .inv-sn-names{font-family:'Dancing Script',cursive,'Playfair Display',Georgia,serif;color:var(--inv-primary);font-size:1.6rem;font-weight:600}

        /* ── CTA banners ── */
        .inv-cta-banner{border-radius:var(--inv-radius);padding:36px 28px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px}
        .inv-cta-banner.rsvp{background:linear-gradient(135deg,var(--inv-primary),color-mix(in srgb,var(--inv-primary) 60%,var(--inv-gold)));box-shadow:0 12px 40px rgba(196,90,116,0.35)}
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
        {!ONLY_DETAILS && (
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
            {date && <span className="inv-hero-date">{formatElegantDate(date)}</span>}
            {date && venueName && <span className="inv-hero-rule" aria-hidden="true" />}
            {venueName && <span className="inv-hero-venue">{venueName}</span>}
          </div>
          <div className="inv-hero-ctas">
            <a href="#rsvp" className="inv-btn-primary">✉ RSVP</a>
            <a href="#find-table" className="inv-btn-secondary">🪑 Find My Seat</a>
          </div>
          <div className="inv-scroll-hint" aria-hidden="true">Scroll</div>
        </header>
        )}

        {/* ─── BODY ─── */}
        <div className="inv-body">

          {/* ── With Love Invitation Card ── */}
          {!ONLY_DETAILS && (
          <section className="inv-card inv-love-card">
            <p className="inv-love-tag">With Love</p>
            <p className="inv-love-text">
              Together with their families,<br />
              <span className="inv-love-names">{brideName} &amp; {groomName}</span>
              joyfully invite you to celebrate<br />
              the beginning of their forever.
            </p>
          </section>
          )}

          {/* ── Elegant Wedding Details Card ── */}
          {(date || venueName || eventTime) && (
            <section className="inv-card inv-details-elegant" data-testid="public-event-details">
              <p className="inv-ede-eyebrow">Reception</p>
              <div className="inv-ede-sep"><span>&#10086;</span></div>
              <h2 className="inv-ede-heading">Wedding Details</h2>

              {date && (
                <div className="inv-ede-item">
                  <div className="inv-ede-iconrow">
                    <span className="inv-ede-icon">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 9.5h16M8.5 3.5v4M15.5 3.5v4"/></svg>
                    </span>
                  </div>
                  <p className="inv-ede-item-label">{getDayName(date)}</p>
                  <p className="inv-ede-item-value inv-ede-accent">{formatElegantDate(date)}</p>
                </div>
              )}

              {eventTime && (
                <>
                  <div className="inv-ede-sep"><span>&#10086;</span></div>
                  <div className="inv-ede-item">
                    <div className="inv-ede-iconrow">
                      <span className="inv-ede-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.6 1.6"/></svg>
                      </span>
                    </div>
                    <p className="inv-ede-item-label">Time</p>
                    <p className="inv-ede-item-value">{formatTimeOnwards(eventTime)}</p>
                  </div>
                </>
              )}

              {venueName && (
                <>
                  <div className="inv-ede-sep"><span>&#10086;</span></div>
                  <div className="inv-ede-item">
                    <div className="inv-ede-iconrow">
                      <span className="inv-ede-icon">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>
                      </span>
                    </div>
                    <p className="inv-ede-item-label">Venue</p>
                    <p className="inv-ede-item-value">{venueName}</p>
                    {venueAddress && <p className="inv-ede-item-addr">{venueAddress}</p>}
                  </div>
                </>
              )}

              {rsvpDeadline && (
                <p className="inv-ede-rsvp-by">
                  Please RSVP by <strong>{formatElegantDate(rsvpDeadline)}</strong>
                </p>
              )}

              {venueMapLink && (
                <a href={venueMapLink} target="_blank" rel="noopener noreferrer" className="inv-btn-location">
                  View Location
                </a>
              )}
            </section>
          )}

          {!ONLY_DETAILS && (<>
          {/* ── Countdown ── */}
          {date && (
            <section className="inv-card inv-countdown-card">
              <p className="inv-section-label" style={{marginBottom:6}}>Counting down to</p>
              <CountdownTimer date={date} timezone={'UTC'} />
            </section>
          )}

{/* ── Agenda ── */}
          {agenda.length > 0 && (
            <section className="inv-card" data-testid="public-agenda" style={{textAlign:'center'}}>
              <p className="inv-section-label">The day</p>
              <h2 className="inv-section-title">Day&apos;s Schedule</h2>
              <p className="inv-section-body" style={{maxWidth:460,margin:'0 auto 32px'}}>
                The celebration timeline — we can&apos;t wait to share these moments with you.
              </p>
              <div className="inv-agenda-track" data-testid="public-agenda-list" role="list">
                {agenda.map((item, idx) => {
                  const start = timeFromTimestamp(item.eventTime);
                  const contentLeft = idx % 2 === 0;
                  const timeEl = (
                    <time className="inv-agenda-time" data-testid="public-agenda-time">
                      {formatTime(start)}
                    </time>
                  );
                  const contentEl = (
                    <>
                      <h3 className="inv-agenda-title" data-testid="public-agenda-title">{item.title}</h3>
                      {item.description && <p className="inv-agenda-desc" data-testid="public-agenda-description">{item.description}</p>}
                    </>
                  );
                  return (
                    <article key={item.id} className="inv-agenda-entry" data-testid="public-agenda-item" role="listitem">
                      <div className="inv-agenda-col-l">
                        {contentLeft ? contentEl : timeEl}
                      </div>
                      <div className="inv-agenda-dot" data-testid="public-agenda-icon" style={{color:'var(--inv-primary)'}}>
                        <AgendaIcon icon={item.iconKey} size={22} />
                      </div>
                      <div className="inv-agenda-col-r">
                        {contentLeft ? timeEl : contentEl}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Moments of Love Gallery (masonry) ── */}
          <section className="inv-card inv-masonry-card" data-testid="public-gallery">
            <div className="inv-masonry-header">
              <p className="inv-section-label">Gallery</p>
              <h2 className="inv-masonry-script">Moments of Love</h2>
              <p className="inv-masonry-sub">A few precious memories shared ahead of our celebration.</p>
            </div>
            <div className="inv-masonry-grid" data-testid="public-gallery-grid">
              {displayGalleryImages.map((img) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <div key={img.id} className="inv-masonry-item">
                  <img src={img.imageUrl} alt="Wedding memory" loading="lazy" />
                </div>
              ))}
            </div>
          </section>

          {/* ── RSVP CTA ── */}
          {guestToken ? (
            <section className="inv-card" data-testid="public-rsvp-cta" id="rsvp">
              <p className="inv-section-label" style={{ textAlign: 'center' }}>Kindly Reply</p>
              <h2 className="inv-section-title" style={{ textAlign: 'center' }}>We&apos;d love to know you&apos;re coming.</h2>
              <p className="inv-section-body" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
                Your response helps us prepare seating, meals, and a warm welcome for you and your family. Find your table and confirm your place below.
              </p>
            </section>
          ) : (
            <div className="inv-cta-banner rsvp" data-testid="public-rsvp-cta" id="rsvp">
              <h2 className="inv-section-title">We&apos;d love to know you&apos;re coming.</h2>
              <p className="inv-section-body">
                Please use the personal link shared with you to RSVP, or contact the couple directly.
              </p>
              <p style={{color:'rgba(255,255,255,0.80)',fontSize:'.9rem'}}>
                Your invite link contains your personal RSVP access.
              </p>
            </div>
          )}

          {/* ── Find Your Table (inline search) ── */}
          <FindTableInline slug={slug} guestToken={guestToken} />
          </>)}

        </div>

        {/* ── Special Note ── */}
        {!ONLY_DETAILS && specialNoteText && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 32px' }}>
            <div className="inv-sn-wrap">
              <div className="inv-sn-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={couplePhotoRow?.imageUrl || DEFAULT_COUPLE_PHOTO} alt={`${brideName} & ${groomName}`} />
              </div>
              <div className="inv-sn-card">
                <p className="inv-sn-eyebrow">A Special Note</p>
                <h2 className="inv-sn-heading">To Our Lovely Guests</h2>
                <p className="inv-sn-text">{specialNoteText}</p>
                <p className="inv-sn-sign">With all our love,</p>
                <p className="inv-sn-names">{brideName} &amp; {groomName}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        {!ONLY_DETAILS && (
        <footer className="inv-footer">
          <p className="inv-footer-brand">{title}</p>
          <p>
            {date && <span>{formatElegantDate(date)}</span>}
            {date && venueName && <span> · </span>}
            {venueName && <span>{venueName}</span>}
          </p>
          {footerContacts.length > 0 && (
            <p>{footerContacts.map((item, index) => (
              <React.Fragment key={item}>
                {index > 0 && <span> · </span>}
                <span>{item}</span>
              </React.Fragment>
            ))}</p>
          )}
          <p style={{marginTop:16}}>Created with <Link href="/">WedPlan</Link></p>
        </footer>
        )}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org', '@type': 'Event',
              name: title, description,
              startDate: date || undefined,
              location: { '@type': 'Place', name: venueName || undefined, address: venueAddress || undefined },
              image: heroImage,
              organizer: { '@type': 'Person', name: title },
            }),
          }}
        />
      </div>

      {/* Floating music player */}
      {musicEnabled && <FloatingMusicPlayer src={musicSrc} />}
    </>
  );
}
