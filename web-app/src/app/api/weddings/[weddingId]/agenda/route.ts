import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';
import { listAgenda, createAgenda, reorderAgenda, type DashboardAgenda } from '@/lib/wedding-data';
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

interface WeddingRow {
  id: string;
  slug: string | null;
  groomFirstName: string | null;
  brideFirstName: string | null;
  eventDate: string | null;
  venueName: string | null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function minutes(value: string) {
  const [hours, mins] = value.split(':').map(Number);
  return (hours * 60) + mins;
}

function validateAgendaPayload(body: AgendaPayload) {
  const title = String(body?.title || '').trim();
  const startTime = String(body?.startTime || '').trim();
  const endTime = String(body?.endTime || '').trim();
  if (!title) return 'Title is required';
  if (!TIME_RE.test(startTime)) return 'Start time must use HH:mm format';
  if (!TIME_RE.test(endTime)) return 'End time must use HH:mm format';
  if (minutes(endTime) <= minutes(startTime)) return 'End time must be after start time';
  return '';
}

function buildScheduleExport(wedding: WeddingRow, events: DashboardAgenda[]) {
  const title = `${wedding.brideFirstName || 'Wedding'} & ${wedding.groomFirstName || 'Celebration'}`;
  const lines = [
    `# ${title} Schedule`,
    '',
    `Date: ${wedding.eventDate ? wedding.eventDate.slice(0, 10) : 'TBD'}`,
    `Venue: ${wedding.venueName || 'TBD'}`,
    '',
    '| Time | Event | Notes |',
    '| --- | --- | --- |',
    ...events.map(event => `| ${event.startTime}-${event.endTime} | ${event.title} | ${(event.description || '-').replace(/\|/g, '/')} |`),
    '',
  ];
  return lines.join('\n');
}

async function getWedding(weddingId: string) {
  const rows = await dbSelect<WeddingRow>('Wedding', { id: `eq.${weddingId}` }, '*', 1);
  return rows[0] || null;
}

export async function GET(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = await getWedding(weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  const events = await listAgenda(weddingId);
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
    if (!(await getWedding(weddingId))) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json() as AgendaPayload;
    const validationError = validateAgendaPayload(body);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const event = await createAgenda(weddingId, {
      title: String(body.title).trim(),
      startTime: String(body.startTime).trim(),
      endTime: String(body.endTime).trim(),
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
    if (!(await getWedding(weddingId))) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ ok: false, error: 'orderedIds array required' }, { status: 400 });
    }

    return NextResponse.json(await reorderAgenda(weddingId, body.orderedIds.map(String)));
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
