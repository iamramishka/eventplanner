import { NextResponse } from 'next/server';
import { listAgenda, updateAgendaById, deleteAgendaById } from '@/lib/wedding-data';
import { requireAgendaAccess } from '@/lib/rbac';
import { dbSelect } from '@/lib/supabase-db';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type AgendaPayload = {
  title?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  icon?: string;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function minutes(value: string) {
  const [hours, mins] = value.split(':').map(Number);
  return (hours * 60) + mins;
}

function validateAgendaPayload(body: { title?: string; startTime?: string; endTime?: string }) {
  const title = String(body?.title || '').trim();
  const startTime = String(body?.startTime || '').trim();
  const endTime = String(body?.endTime || '').trim();
  if (!title) return 'Title is required';
  if (!TIME_RE.test(startTime)) return 'Start time must use HH:mm format';
  if (!TIME_RE.test(endTime)) return 'End time must use HH:mm format';
  if (minutes(endTime) <= minutes(startTime)) return 'End time must be after start time';
  return '';
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireAgendaAccess(id);
    if (access.response) return access.response;

    // Find the existing item (across its wedding) to merge fields for validation.
    const rows = await dbSelect<{ weddingId: string }>('AgendaItem', { id: `eq.${id}` }, 'weddingId', 1);
    if (!rows[0]) {
      return NextResponse.json({ ok: false, error: 'Agenda event not found' }, { status: 404 });
    }
    const all = await listAgenda(rows[0].weddingId);
    const existing = all.find((e) => e.id === id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Agenda event not found' }, { status: 404 });
    }

    const body = await request.json() as AgendaPayload;
    const merged = {
      title: body.title ?? existing.title,
      startTime: body.startTime ?? existing.startTime,
      endTime: body.endTime ?? existing.endTime,
    };
    const validationError = validateAgendaPayload(merged);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const updated = await updateAgendaById(id, {
      title: merged.title,
      startTime: merged.startTime,
      endTime: merged.endTime,
      description: String(body.description ?? existing.description ?? '').trim(),
      icon: String(body.icon ?? existing.icon ?? 'CalendarDays').trim(),
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireAgendaAccess(id);
  if (access.response) return access.response;
  const removed = await deleteAgendaById(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Agenda event not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
