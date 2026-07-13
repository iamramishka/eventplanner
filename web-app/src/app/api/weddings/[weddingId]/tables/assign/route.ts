import { NextResponse } from 'next/server';
import { dbSelect } from '@/lib/supabase-db';
import {
  assignGuestToTable,
  getTableAssignmentSnapshot,
  listTables,
  restoreTableAssignmentSnapshot,
  unassignGuestFromTable,
  getGuestRow,
} from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

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
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;
  const wedding = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  if (!wedding[0]) return jsonError('Wedding not found', 404);

  try {
    const body = await req.json();
    const action = String(body?.action || '');

    if (action === 'assign') {
      if (!body?.tableId) return jsonError('tableId required');
      if (!body?.guestId) return jsonError('guestId required');
      const snapshot = await getTableAssignmentSnapshot(weddingId);
      const result = await assignGuestToTable(weddingId, String(body.tableId), String(body.guestId));
      return NextResponse.json({ ok: true, data: { ...result, snapshot, tables: await listTables(weddingId) } });
    }

    if (action === 'unassign') {
      if (!body?.guestId) return jsonError('guestId required');
      const snapshot = await getTableAssignmentSnapshot(weddingId);
      const result = await unassignGuestFromTable(weddingId, String(body.guestId));
      return NextResponse.json({ ok: true, data: { ...result, snapshot, tables: await listTables(weddingId) } });
    }

    if (action === 'bulkAssign') {
      if (!body?.tableId) return jsonError('tableId required');
      const guestIds: string[] = Array.isArray(body?.guestIds) ? body.guestIds.map(String) : [];
      if (!guestIds.length) return jsonError('guestIds required');
      const snapshot = await getTableAssignmentSnapshot(weddingId);
      const results = [];
      for (const guestId of guestIds) {
        try {
          results.push({ ok: true, ...(await assignGuestToTable(weddingId, String(body.tableId), guestId)) });
        } catch (err: unknown) {
          const error = String(err instanceof Error ? err.message : err);
          const guest = await getGuestRow(guestId);
          results.push({ ok: false, guestId, guestName: guest?.name || guestId, error, code: codeForError(error) });
        }
      }
      return NextResponse.json({
        ok: results.every(item => item.ok),
        data: { results, snapshot, tables: await listTables(weddingId) },
      });
    }

    if (action === 'undo') {
      const restored = await restoreTableAssignmentSnapshot(weddingId, body?.snapshot);
      return NextResponse.json({ ok: true, data: { tables: restored } });
    }

    return jsonError('invalid action');
  } catch (err: unknown) {
    const message = String(err instanceof Error ? err.message : err);
    return jsonError(message);
  }
}
