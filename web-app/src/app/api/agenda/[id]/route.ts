import { NextResponse } from 'next/server';
import { db, deleteAgendaEvent, updateAgendaEvent } from '@/lib/store';

type AgendaPayload = {
  title?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  description?: string;
  icon?: string;
};

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = db.agenda.findMany((event: any) => event.id === id)[0];
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Agenda event not found' }, { status: 404 });
    }

    const body = await request.json();
    const validationError = validateAgendaPayload({ ...existing, ...body }, existing.timezone);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const updated = updateAgendaEvent(id, {
      title: String(body.title ?? existing.title).trim(),
      startTime: String(body.startTime ?? existing.startTime).trim(),
      endTime: String(body.endTime ?? existing.endTime).trim(),
      timezone: String(body.timezone ?? existing.timezone).trim(),
      location: String(body.location ?? existing.location ?? '').trim(),
      description: String(body.description ?? existing.description ?? '').trim(),
      icon: String(body.icon ?? existing.icon ?? 'CalendarDays').trim(),
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteAgendaEvent(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Agenda event not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, removed });
}
