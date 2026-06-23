import { NextResponse } from 'next/server';
import { dbSelect, dbUpdate } from '@/lib/supabase-db';
import { requireWeddingAccess } from '@/lib/rbac';

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
  slug: string;
  setupCompleted: boolean | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
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
    estimatedGuests: w.estimatedGuests ?? null,
    estimatedBudget: w.estimatedBudget ?? null,
    setupCompleted: !!w.setupCompleted,
    sections: {},
    theme: {},
  };
}

async function loadWedding(weddingId: string) {
  const rows = await dbSelect<WeddingRow>('Wedding', { id: `eq.${weddingId}` }, '*', 1);
  return rows[0] || null;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = await loadWedding(weddingId);
  if (!wedding) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }
  return NextResponse.json(toDashboardWedding(wedding));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const payload = await request.json().catch(() => ({}));
  const existing = await loadWedding(weddingId);
  if (!existing) {
    return NextResponse.json({ error: 'Wedding not found' }, { status: 404 });
  }

  const cols: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (payload.brideName !== undefined) cols.brideFirstName = String(payload.brideName || '');
  if (payload.groomName !== undefined) cols.groomFirstName = String(payload.groomName || '');
  if (payload.date !== undefined) cols.eventDate = payload.date ? `${String(payload.date).slice(0, 10)}T00:00:00` : null;
  if (payload.time !== undefined) cols.eventTime = payload.time ? String(payload.time) : null;
  if (payload.venueName !== undefined) cols.venueName = payload.venueName ? String(payload.venueName) : null;
  if (payload.venueAddress !== undefined) cols.venueAddress = payload.venueAddress ? String(payload.venueAddress) : null;
  if (payload.venueMapLink !== undefined) cols.venueMapLink = payload.venueMapLink ? String(payload.venueMapLink) : null;
  if (payload.rsvpDeadline !== undefined) cols.rsvpDeadline = payload.rsvpDeadline ? String(payload.rsvpDeadline).slice(0, 10) : null;
  if (payload.specialNoteText !== undefined) cols.specialNoteText = payload.specialNoteText ? String(payload.specialNoteText) : null;
  if (payload.estimatedGuests !== undefined) cols.estimatedGuests = Number.isFinite(Number(payload.estimatedGuests)) ? Number(payload.estimatedGuests) : null;
  if (payload.estimatedBudget !== undefined) cols.estimatedBudget = Number.isFinite(Number(payload.estimatedBudget)) ? Number(payload.estimatedBudget) : null;
  if (payload.setupCompleted !== undefined) cols.setupCompleted = !!payload.setupCompleted;

  await dbUpdate('Wedding', { id: `eq.${weddingId}` }, cols);
  const updated = await loadWedding(weddingId);

  // Merge persisted result with any echoed UI-only fields the client sent.
  return NextResponse.json({ ...payload, ...toDashboardWedding(updated as WeddingRow) });
}
