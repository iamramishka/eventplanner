import { NextResponse } from 'next/server';
import { dbSelect, dbUpdate, dbUpsert } from '@/lib/supabase-db';
import { requireWeddingAccess } from '@/lib/rbac';
import { getAdminSettings } from '@/lib/adminSettings';
import { getAdminCouples } from '@/lib/adminCouples';

interface WeddingRow {
  id: string;
  userId: string;
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
  slug: string;
  setupCompleted: boolean | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
  createdAt?: string | null;
}

interface SiteSettingsRow {
  id: string;
  weddingId: string;
  musicSettings: string | null;
}

/** Supabase row → the flat shape the dashboard expects. */
function toDashboardWedding(w: WeddingRow) {
  return {
    id: w.id,
    slug: w.slug,
    brideName: w.brideFirstName,
    groomName: w.groomFirstName,
    weddingTitle: `${w.brideFirstName} & ${w.groomFirstName}`,
    date: w.eventDate ? w.eventDate.slice(0, 10) : '',
    time: w.eventTime || '',
    timezone: 'UTC',
    venueName: w.venueName || '',
    venueAddress: w.venueAddress || '',
    venueMapLink: w.venueMapLink || '',
    rsvpDeadline: w.rsvpDeadline ? w.rsvpDeadline.slice(0, 10) : '',
    specialNoteText: w.specialNoteText || '',
    contactEmail: w.contactEmail || '',
    contactWhatsApp: w.contactWhatsApp || '',
    estimatedGuests: w.estimatedGuests ?? null,
    estimatedBudget: w.estimatedBudget ?? null,
    ownerUserId: w.userId,
    createdAt: w.createdAt || '',
    setupCompleted: !!w.setupCompleted,
    sections: {},
    theme: {},
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function withTrialMetadata(wedding: ReturnType<typeof toDashboardWedding>) {
  const defaultTrialDays = getAdminSettings().settings.trial.defaultTrialDays;
  const adminCouple = getAdminCouples().find((couple) => couple.id === wedding.ownerUserId);
  const createdAt = adminCouple?.createdAt || wedding.createdAt || new Date().toISOString();
  const createdDate = new Date(createdAt);
  const fallbackTrialEnds = addDays(Number.isNaN(createdDate.getTime()) ? new Date() : createdDate, defaultTrialDays).toISOString();

  return {
    ...wedding,
    plan: adminCouple?.plan || 'trial',
    trialEnds: adminCouple?.trialEnds || fallbackTrialEnds,
    defaultTrialDays,
  };
}

async function loadWedding(weddingId: string) {
  const rows = await dbSelect<WeddingRow>('Wedding', { id: `eq.${weddingId}` }, '*', 1);
  return rows[0] || null;
}

async function loadSiteSettings(weddingId: string) {
  const rows = await dbSelect<SiteSettingsRow>('SiteSettings', { weddingId: `eq.${weddingId}` }, 'id,weddingId,musicSettings', 1);
  return rows[0] || null;
}

function parseMusicSettings(raw: string | null | undefined) {
  if (!raw) return null;
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; }
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const [wedding, siteSettings] = await Promise.all([loadWedding(weddingId), loadSiteSettings(weddingId)]);
  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  const music = parseMusicSettings(siteSettings?.musicSettings);
  return NextResponse.json({ ...withTrialMetadata(toDashboardWedding(wedding)), ...(music ? { music } : {}) });
}

function validateWeddingPayload(payload: Record<string, unknown>): string | null {
  // Names
  if (payload.brideName !== undefined) {
    const v = String(payload.brideName || '').trim();
    if (!v) return "Bride's name is required.";
    if (v.length > 50) return "Bride's name must be 50 characters or fewer.";
  }
  if (payload.groomName !== undefined) {
    const v = String(payload.groomName || '').trim();
    if (!v) return "Groom's name is required.";
    if (v.length > 50) return "Groom's name must be 50 characters or fewer.";
  }

  // Dates
  const dateStr = payload.date !== undefined ? String(payload.date || '') : null;
  const rsvpStr = payload.rsvpDeadline !== undefined ? String(payload.rsvpDeadline || '') : null;

  if (dateStr !== null && dateStr) {
    const d = new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
    if (isNaN(d.getTime())) return 'Wedding date is not a valid date.';
    if (d < new Date()) return 'Wedding date must be in the future.';
  }

  if (rsvpStr !== null && rsvpStr && dateStr) {
    const rsvp = new Date(`${rsvpStr.slice(0, 10)}T00:00:00.000Z`);
    const event = new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
    if (!isNaN(rsvp.getTime()) && !isNaN(event.getTime()) && rsvp >= event) {
      return 'RSVP deadline must be before the wedding date.';
    }
  }

  // Venue
  if (payload.venueName !== undefined) {
    const v = String(payload.venueName || '').trim();
    if (v.length > 100) return 'Venue name must be 100 characters or fewer.';
  }

  // Map link
  if (payload.venueMapLink !== undefined) {
    const v = String(payload.venueMapLink || '').trim();
    if (v && !/^https?:\/\/.+/.test(v)) return 'Google Maps link must start with http:// or https://';
  }

  // Contact
  if (payload.contactEmail !== undefined) {
    const v = String(payload.contactEmail || '').trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Contact email is not a valid email address.';
  }
  if (payload.contactWhatsApp !== undefined) {
    const v = String(payload.contactWhatsApp || '').trim();
    if (v && !/^\+?[\d\s\-()]{7,20}$/.test(v)) return 'WhatsApp number must be a valid phone number (e.g. +94771234567).';
  }

  // Numbers
  if (payload.estimatedGuests !== undefined && payload.estimatedGuests !== null && payload.estimatedGuests !== '') {
    const n = Number(payload.estimatedGuests);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return 'Estimated guests must be a positive whole number.';
  }
  if (payload.estimatedBudget !== undefined && payload.estimatedBudget !== null && payload.estimatedBudget !== '') {
    const n = Number(payload.estimatedBudget);
    if (!Number.isFinite(n) || n < 0) return 'Estimated budget must be a positive number.';
  }

  return null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const validationError = validateWeddingPayload(payload as Record<string, unknown>);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existing = await loadWedding(weddingId);
  if (!existing) {
    return NextResponse.json({ error: 'Wedding not found.' }, { status: 404 });
  }

  const cols: Record<string, unknown> = { updatedAt: new Date() };
  if (payload.brideName !== undefined) cols.brideFirstName = String(payload.brideName || '').trim();
  if (payload.groomName !== undefined) cols.groomFirstName = String(payload.groomName || '').trim();
  if (payload.date !== undefined) cols.eventDate = payload.date ? new Date(`${String(payload.date).slice(0, 10)}T00:00:00.000Z`) : null;
  if (payload.time !== undefined) cols.eventTime = payload.time ? String(payload.time) : null;
  if (payload.venueName !== undefined) cols.venueName = payload.venueName ? String(payload.venueName).trim() : null;
  if (payload.venueAddress !== undefined) cols.venueAddress = payload.venueAddress ? String(payload.venueAddress).trim() : null;
  if (payload.venueMapLink !== undefined) cols.venueMapLink = payload.venueMapLink ? String(payload.venueMapLink).trim() : null;
  if (payload.rsvpDeadline !== undefined) cols.rsvpDeadline = payload.rsvpDeadline ? new Date(`${String(payload.rsvpDeadline).slice(0, 10)}T00:00:00.000Z`) : null;
  if (payload.specialNoteText !== undefined) cols.specialNoteText = payload.specialNoteText ? String(payload.specialNoteText).trim() : null;
  if (payload.contactEmail !== undefined) cols.contactEmail = payload.contactEmail ? String(payload.contactEmail).trim() : null;
  if (payload.contactWhatsApp !== undefined) cols.contactWhatsApp = payload.contactWhatsApp ? String(payload.contactWhatsApp).trim() : null;
  if (payload.estimatedGuests !== undefined) cols.estimatedGuests = (payload.estimatedGuests !== null && payload.estimatedGuests !== '') ? Number(payload.estimatedGuests) : null;
  if (payload.estimatedBudget !== undefined) cols.estimatedBudget = (payload.estimatedBudget !== null && payload.estimatedBudget !== '') ? Number(payload.estimatedBudget) : null;
  if (payload.setupCompleted !== undefined) cols.setupCompleted = !!payload.setupCompleted;

  await dbUpdate('Wedding', { id: `eq.${weddingId}` }, cols);

  let savedMusic: Record<string, unknown> | null = null;
  if (payload.music !== undefined) {
    const siteSettings = await loadSiteSettings(weddingId);
    await dbUpsert<SiteSettingsRow>('SiteSettings', {
      ...(siteSettings ? { id: siteSettings.id } : {}),
      weddingId,
      musicSettings: JSON.stringify(payload.music),
    }, 'weddingId');
    savedMusic = payload.music as Record<string, unknown>;
  }

  const updated = await loadWedding(weddingId);
  return NextResponse.json({
    ...payload,
    ...withTrialMetadata(toDashboardWedding(updated as WeddingRow)),
    ...(savedMusic ? { music: savedMusic } : {}),
  });
}
