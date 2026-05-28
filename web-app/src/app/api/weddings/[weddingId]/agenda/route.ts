import { NextResponse } from 'next/server';
import {
  addAgendaEvent,
  db,
  getAgendaEventsByWedding,
  reorderAgendaEvents,
} from '@/lib/store';
import { requireWeddingAccess } from '@/lib/rbac';

type AgendaPayload = {
  title?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  description?: string;
  icon?: string;
};

type WeddingRow = {
  id?: unknown;
  weddingTitle?: string;
  brideName?: string;
  groomName?: string;
  date?: string;
  timezone?: string;
  venueName?: string;
  slug?: string;
};

type AgendaRow = {
  startTime?: string;
  endTime?: string;
  title?: string;
  location?: string;
  description?: string;
  timezone?: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function minutes(value: string) {
  const [hours, mins] = value.split(':').map(Number);
  return (hours * 60) + mins;
}

function validateAgendaPayload(body: AgendaPayload, fallbackTimezone: string) {
  const title = String(body?.title || '').trim();
  const startTime = String(body?.startTime || '').trim();
  const endTime = String(body?.endTime || '').trim();
  const timezone = String(body?.timezone || fallbackTimezone || '').trim();

  if (!title) return 'Title is required';
  if (!TIME_RE.test(startTime)) return 'Start time must use HH:mm format';
  if (!TIME_RE.test(endTime)) return 'End time must use HH:mm format';
  if (minutes(endTime) <= minutes(startTime)) return 'End time must be after start time';
  if (!timezone || !isValidTimezone(timezone)) return 'Select a valid IANA timezone';
  return '';
}

function buildScheduleExport(wedding: WeddingRow, events: AgendaRow[]) {
  const title = wedding.weddingTitle || `${wedding.brideName || 'Wedding'} & ${wedding.groomName || 'Celebration'}`;
  const lines = [
    `# ${title} Schedule`,
    '',
    `Date: ${wedding.date || 'TBD'}`,
    `Timezone: ${wedding.timezone || events[0]?.timezone || 'TBD'}`,
    `Venue: ${wedding.venueName || 'TBD'}`,
    '',
    '| Time | Event | Location | Notes |',
    '| --- | --- | --- | --- |',
    ...events.map(event => `| ${event.startTime}-${event.endTime} | ${event.title} | ${event.location || '-'} | ${(event.description || '-').replace(/\|/g, '/')} |`),
    '',
  ];

  return lines.join('\n');
}

export async function GET(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = db.weddings.findUnique((w: WeddingRow) => w.id === weddingId) as WeddingRow | null;
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const events = getAgendaEventsByWedding(weddingId);
  const url = new URL(request.url);
  if (url.searchParams.get('format') === 'markdown') {
    return new NextResponse(buildScheduleExport(wedding, events), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${wedding.slug || weddingId}-schedule.md"`,
      },
    });
  }

  return NextResponse.json(events);
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    const wedding = db.weddings.findUnique((w: WeddingRow) => w.id === weddingId) as WeddingRow | null;
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json() as AgendaPayload;
    const validationError = validateAgendaPayload(body, wedding.timezone || '');
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const event = addAgendaEvent({
      weddingId,
      title: String(body.title).trim(),
      startTime: String(body.startTime).trim(),
      endTime: String(body.endTime).trim(),
      timezone: String(body.timezone || wedding.timezone || '').trim(),
      location: String(body.location || '').trim(),
      description: String(body.description || '').trim(),
      icon: String(body.icon || 'CalendarDays').trim(),
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    const wedding = db.weddings.findUnique((w: WeddingRow) => w.id === weddingId) as WeddingRow | null;
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ ok: false, error: 'orderedIds array required' }, { status: 400 });
    }

    return NextResponse.json(reorderAgendaEvents(weddingId, body.orderedIds.map(String)));
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
