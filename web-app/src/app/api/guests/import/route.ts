import { NextResponse } from 'next/server';
import { importGuestRows } from '@/lib/wedding-data';
import { requireWeddingAccess } from '@/lib/rbac';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Array<Record<string,string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const obj: Record<string,string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (parts[j] || '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

function mapImportRow(row: Record<string, string>, weddingId: string): Record<string, unknown> {
  // Supports the 10-column template and legacy formats
  const guestName   = row['Guest Name']      || row['name']              || '';
  const familyName  = row['Family Name']     || '';
  const sideRaw     = (row['Side'] || row['Guest Type'] || row['side'] || '').trim().toUpperCase();
  const side        = sideRaw === 'G' ? 'Groom' : sideRaw === 'B' ? 'Bride' : sideRaw || 'Guest';
  const invType     = row['Invitation Type'] || row['type']              || 'Individual';
  const maxMembers  = row['Max Members']     || row['maxMembers']        || '';
  const whatsapp    = row['WhatsApp']        || row['whatsapp']          || '';
  const email       = row['Email']           || row['email']             || '';
  const mealPref    = row['Meal Preference'] || row['mealPreference']    || '';
  const liquorRaw   = (row['Taking Liquor'] || row['liquorPreference']  || '').trim();
  const liquorPref  = liquorRaw.toLowerCase() === 'yes' ? 'Yes'
                    : liquorRaw.toLowerCase() === 'no'  ? 'No'
                    : liquorRaw;
  const notes = [
    familyName              ? `Family: ${familyName}` : '',
    row['Notes'] || row['notes'] || '',
  ].filter(Boolean).join(' | ');

  return {
    weddingId,
    name:             guestName,
    side,
    whatsapp,
    email,
    type:             invType,
    maxMembers:       maxMembers ? Number(maxMembers) : undefined,
    notes,
    mealPreference:   mealPref,
    liquorPreference: liquorPref,
  };
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const text = await req.text();
    const rows = parseCsv(text);
    // weddingId: prefer query param (new template), fall back to CSV column (legacy)
    const weddingId = url.searchParams.get('weddingId') || rows[0]?.weddingId || rows[0]?.weddingid || rows[0]?.wedding || '';
    if (!weddingId) return NextResponse.json({ ok: false, error: 'weddingId required' }, { status: 400 });
    const access = await requireWeddingAccess(String(weddingId));
    if (access.response) return access.response;
    const mapped = rows.map(r => mapImportRow(r, weddingId));
    const created = await importGuestRows(mapped);
    return NextResponse.json({ ok: true, createdCount: created.length, created });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 400 });
  }
}
