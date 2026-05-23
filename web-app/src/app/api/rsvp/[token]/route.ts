import { NextResponse } from 'next/server';
import { auditLog } from '@/lib/audit';
import {
  getGuestByToken,
  getRsvpByGuestId,
  getWeddingForGuest,
  upsertRsvpForGuest,
} from '@/lib/store';

const MIN_SUBMIT_MS = 1200;
const MAX_NOTES_LENGTH = 500;

function sanitizeContext(token: string) {
  const guest = getGuestByToken(token);
  if (!guest) return null;

  const wedding = getWeddingForGuest(guest);
  if (!wedding) return null;

  const rsvp = getRsvpByGuestId(guest.id);

  return {
    wedding: {
      id: wedding.id,
      brideName: wedding.brideName,
      groomName: wedding.groomName,
      weddingTitle: wedding.weddingTitle,
      date: wedding.date,
      time: wedding.time,
      venueName: wedding.venueName,
      venueAddress: wedding.venueAddress,
      rsvpDeadline: wedding.rsvpDeadline,
      slug: wedding.slug,
      theme: wedding.theme || {},
    },
    guest: {
      name: guest.name,
      side: guest.side,
      type: guest.type,
      maxMembers: Number(guest.maxMembers) || 1,
      rsvpStatus: guest.rsvpStatus || 'Pending',
    },
    rsvp: rsvp
      ? {
          attending: !!rsvp.attending,
          memberCount: Number(rsvp.memberCount) || 0,
          mealPreference: rsvp.mealPreference || '',
          liquorPreference: rsvp.liquorPreference || '',
          notes: rsvp.notes || '',
          updatedAt: rsvp.updatedAt,
        }
      : null,
  };
}

function validatePayload(body: any, maxMembers: number) {
  if (body?.website || body?.company || body?.honeypot) {
    return 'Spam check failed.';
  }

  const startedAt = Number(body?.startedAt);
  if (!startedAt || Date.now() - startedAt < MIN_SUBMIT_MS) {
    return 'Please take a moment before submitting your RSVP.';
  }

  if (typeof body?.attending !== 'boolean') {
    return 'Please choose whether you can attend.';
  }

  const memberCount = Number(body?.memberCount);
  if (body.attending && (!Number.isInteger(memberCount) || memberCount < 1 || memberCount > maxMembers)) {
    return `Guest count must be between 1 and ${maxMembers}.`;
  }

  if (!body.attending && memberCount !== 0) {
    return 'Declined responses must have a guest count of 0.';
  }

  if (String(body?.notes || '').length > MAX_NOTES_LENGTH) {
    return `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`;
  }

  return '';
}

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = sanitizeContext(token);

  if (!context) {
    return NextResponse.json({ ok: false, error: 'Invalid invitation token' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...context });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const guest = getGuestByToken(token);
    if (!guest) {
      return NextResponse.json({ ok: false, error: 'Invalid invitation token' }, { status: 404 });
    }

    const wedding = getWeddingForGuest(guest);
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const maxMembers = Number(guest.maxMembers) || 1;
    const validationError = validatePayload(body, maxMembers);
    if (validationError) {
      return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
    }

    const attending = Boolean(body.attending);
    const saved = upsertRsvpForGuest(guest, {
      attending,
      memberCount: attending ? Number(body.memberCount) : 0,
      mealPreference: attending ? String(body.mealPreference || 'any') : '',
      liquorPreference: attending ? String(body.liquorPreference || 'No') : '',
      notes: String(body.notes || '').trim(),
    });

    await auditLog({
      action: 'token-rsvp-submit',
      targetId: saved?.id || guest.id,
      data: { weddingId: wedding.id, guestName: guest.name, attending },
    });

    return NextResponse.json({
      ok: true,
      message: attending ? 'Your RSVP is confirmed.' : 'Your RSVP has been recorded.',
      rsvp: {
        attending: saved?.attending,
        memberCount: saved?.memberCount,
        mealPreference: saved?.mealPreference,
        liquorPreference: saved?.liquorPreference,
        notes: saved?.notes,
        updatedAt: saved?.updatedAt,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 400 });
  }
}
