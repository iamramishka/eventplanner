/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import {
  assignGuestToTable,
  db,
  getTableAssignmentSnapshot,
  getTablesByWedding,
  restoreTableAssignmentSnapshot,
  unassignGuestFromTable,
} from '@/lib/store';

function statusForError(message: string) {
  if (/not found/i.test(message)) return 404;
  if (/full|capacity|duplicate/i.test(message)) return 409;
  return 400;
}

function codeForError(message: string) {
  if (/wedding not found/i.test(message)) return 'WEDDING_NOT_FOUND';
  if (/table not found/i.test(message)) return 'TABLE_NOT_FOUND';
  if (/guest not found/i.test(message)) return 'GUEST_NOT_FOUND';
  if (/table is full/i.test(message)) return 'TABLE_FULL';
  if (/capacity/i.test(message)) return 'CAPACITY_CONFLICT';
  if (/duplicate/i.test(message)) return 'DUPLICATE_ASSIGNMENT';
  return 'ASSIGNMENT_ERROR';
}

function jsonError(message: string, status = statusForError(message)) {
  return NextResponse.json({ ok: false, error: message, code: codeForError(message) }, { status });
}

export async function POST(req: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) return jsonError('Wedding not found', 404);

  try {
    const body = await req.json();
    const action = String(body?.action || '');

    if (action === 'assign') {
      if (!body?.tableId) return jsonError('tableId required');
      if (!body?.guestId) return jsonError('guestId required');
      const snapshot = getTableAssignmentSnapshot(weddingId);
      const result = assignGuestToTable(weddingId, String(body.tableId), String(body.guestId));
      return NextResponse.json({ ok: true, data: { ...result, snapshot, tables: getTablesByWedding(weddingId) } });
    }

    if (action === 'unassign') {
      if (!body?.guestId) return jsonError('guestId required');
      const snapshot = getTableAssignmentSnapshot(weddingId);
      const result = unassignGuestFromTable(weddingId, String(body.guestId));
      return NextResponse.json({ ok: true, data: { ...result, snapshot, tables: getTablesByWedding(weddingId) } });
    }

    if (action === 'bulkAssign') {
      if (!body?.tableId) return jsonError('tableId required');
      const guestIds: string[] = Array.isArray(body?.guestIds) ? body.guestIds.map(String) : [];
      if (!guestIds.length) return jsonError('guestIds required');
      const snapshot = getTableAssignmentSnapshot(weddingId);
      const results = guestIds.map(guestId => {
        try {
          return { ok: true, ...assignGuestToTable(weddingId, String(body.tableId), guestId) };
        } catch (err: any) {
          const error = String(err?.message || err);
          return {
            ok: false,
            guestId,
            guestName: db.guests.findMany((g: any) => g.id === guestId)[0]?.name || guestId,
            error,
            code: codeForError(error),
          };
        }
      });

      return NextResponse.json({
        ok: results.every(item => item.ok),
        data: { results, snapshot, tables: getTablesByWedding(weddingId) },
      });
    }

    if (action === 'undo') {
      const restored = restoreTableAssignmentSnapshot(weddingId, body?.snapshot);
      return NextResponse.json({ ok: true, data: { tables: restored } });
    }

    return jsonError('invalid action');
  } catch (err: any) {
    const message = String(err?.message || err);
    return jsonError(message);
  }
}
